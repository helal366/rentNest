import app from "./app";
import { envVars } from "./config";
import { prisma } from "./lib/prisma";

const PORT = envVars.PORT || 5000;
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