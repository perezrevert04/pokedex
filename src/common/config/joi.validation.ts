import * as Joi from 'joi';

export const validationSchema = Joi.object({
  DEFAULT_LIMIT: Joi.number().default(10),
  DEFAULT_OFFSET: Joi.number().default(0),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'provision')
    .default('development'),
  MONGODB: Joi.string().required(),
  PORT: Joi.number().default(3000)
});
