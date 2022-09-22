import "reflect-metadata";
import { http } from "../src/https";

http.listen(5000, () => console.log("Server started in port 5000"));