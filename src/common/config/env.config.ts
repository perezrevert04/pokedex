/* eslint-disable prettier/prettier */

export const EnvConfiguration = () => ({
  defaultLimit  : +process.env.DEFAULT_LIMIT,
  defaultOffset : +process.env.DEFAULT_OFFSET,
  environment   :  process.env.NODE_ENV,
  mongodb       :  process.env.MONGODB,
  port          :  parseInt(process.env.PORT, 10) || 3000
});
