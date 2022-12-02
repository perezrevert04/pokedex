import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios, { AxiosInstance } from 'axios';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { PokeResponse } from './interfaces/poke-response.interface';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) {}

  async execute() {
    const url = 'https://pokeapi.co/api/v2/pokemon?limit=650';
    const data = await this.http.get<PokeResponse>(url);

    const pokemonToBeInserted = data.results.map(({ name, url }) => {
      const no = url.split('/')[6];
      return { name, no };
    });

    await this.pokemonModel.insertMany(pokemonToBeInserted);

    return 'Seeding complete';
  }
}
