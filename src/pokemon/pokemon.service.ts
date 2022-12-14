import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {
  private readonly defaultLimit: number;
  private readonly defaultOffset: number;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly configService: ConfigService
  ) {
    this.defaultLimit = this.configService.get<number>('defaultLimit');
    this.defaultOffset = this.configService.get<number>('defaultOffset');
  }

  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase();

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);

      return pokemon;
    } catch (error) {
      this._handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.defaultOffset } = paginationDto;
    return this.pokemonModel.find().skip(offset).limit(limit).sort({ no: 1 });
  }

  async findOne(term: string) {
    let pokemon: Pokemon;

    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: +term });
    }

    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase() });
    }

    if (!pokemon) {
      throw new NotFoundException(`Pokemon ${term} not found`);
    }

    return pokemon;
  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon: Pokemon = await this.findOne(term);

    if (updatePokemonDto.name) {
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try {
      await this.pokemonModel.updateOne(
        { _id: pokemon._id },
        updatePokemonDto,
        {
          new: true
        }
      );

      return {
        ...pokemon.toJSON(),
        ...updatePokemonDto
      };
    } catch (error) {
      this._handleException(error);
    }
  }

  async remove(id: string) {
    const pokemon = await this.pokemonModel.findByIdAndDelete(id);

    if (!pokemon) {
      throw new NotFoundException(`Pokemon ${id} not found`);
    }

    return pokemon;
  }

  private _handleException(error: any) {
    if (error.code === 11000) {
      throw new BadRequestException('Pokemon already exists', error.keyValue);
    }

    throw new InternalServerErrorException("Can't create/update pokemon");
  }
}
