* first command
```
git init
```
* create .gitignore file and write 
    node_modules
    dist 
    .env
    
* command 
```
pnpm init
pnpm add typescript tsx @types/node --save-dev
pnpm approve-builds
<!-- pnpm install -->
pnpm exec tsc --init
pnpm add prisma @types/pg --save-dev
pnpm approve-builds 
<!-- pnpm install -->
pnpm add @prisma/client @prisma/adapter-pg pg dotenv
```

* package.json add 
  "type":"module",
* package.json into script add 
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",

* replace tsconfig.ts with the following code:
{
  "compilerOptions": {
    "outDir": "./dist",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "types": ["node"],
    "sourceMap": true,
    "declaration": true,
    "declarationMap": true,
    "noUncheckedIndexedAccess": true,
    "strict": true,
    "isolatedModules": true,
    "noUncheckedSideEffectImports": true,
    "moduleDetection": "force",
    "skipLibCheck": true
  },
  // "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}

* then the following commands:
```
pnpm dlx prisma
pnpm approve-builds
pnpm dlx prisma init --output ../generated/prisma
```
* now install express, bcryptjs, cors, cookie parser, http status code, jwt and their type dependencies
bcryptjs has its own type installation with it. so bcryptjs has no need to install it's type 
```
pnpm add express bcryptjs cors cookie-parser http-status-codes jsonwebtoken ms
pnpm add -D @types/express @types/cors @types/cookie-parser @types/jsonwebtoken
```
* src and dist folder at the root directory
* config/index.ts setup: create a config folder into src folder and a index.ts file into config folder.
```
import dotenv from "dotenv";
dotenv.config();
interface EnvVariables{
    PORT: string,
    DATABASE_URL: string,
    NODE_ENV: "development" | "production",
    JWT_ACCESS_SECRET:string,
    JWT_ACCESS_EXPIRES:string,
    JWT_REFRESH_SECRET:string,
    JWT_REFRESH_EXPIRES:string,
    BCRYPT_SALT_ROUND:string,
    APP_URL:string,
}
const loadEnvVariables=():EnvVariables=> {
    const envVars:string[] = ["PORT", "DATABASE_URL", "NODE_ENV", "JWT_ACCESS_SECRET", "JWT_ACCESS_EXPIRES", "BCRYPT_SALT_ROUND",  "JWT_REFRESH_SECRET", "JWT_REFRESH_EXPIRES", "APP_URL"];
    envVars.forEach(element=>{
        if(!process.env[element]){
            throw new Error(`Required environmental variable missing: ${element}`)
        }
    })
    return {
    PORT : process.env.PORT as string,
    DATABASE_URL : process.env.DATABASE_URL as string,
    NODE_ENV: process.env.NODE_ENV as "development" | "production",
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES as string,
    JWT_REFRESH_SECRET:process.env.JWT_REFRESH_SECRET as string,
    JWT_REFRESH_EXPIRES:process.env.JWT_REFRESH_EXPIRES as string,
    BCRYPT_SALT_ROUND: process.env.BCRYPT_SALT_ROUND as string,
    APP_URL: process.env.APP_URL as string,
}
}
export const envVars = loadEnvVariables();
```
* generate prisma
```
 npx prisma generate
```
* prisma connection
- create a folder named "lib" into src. then create a file named prisma.ts
- into the prisma.ts file add the following code:
```
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

* create your own database add DATABASE_URL at .env

* express setup

- app.ts
```
import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { envVars } from "./config";

const app:Application = express();
app.use(cors({
    origin: envVars.APP_URL,
    credentials: true,
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.get("/", (req:Request,res:Response)=>{
    res.send("This is prisma press backend server. Please use the API endpoints to interact with the server.")
})
export default app;
```

- server.ts
```
import app from "./app";
import { prisma } from "./lib/prisma";

const PORT = process.env.PORT || 5000;
async function main(){
    try{
        await prisma.$connect();
        console.log("Connected to the database successfully.");
        app.listen(PORT, ()=>{
            console.log(`Server is running on port ${PORT}`);
        });
    }catch(error){
        console.error("Error starting server:", error);
        prisma.$disconnect();
        process.exit(1);
    }
}
main();
```

