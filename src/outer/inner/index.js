import { findUp } from "find-up";
console.log(await findUp("example.js" , {cwd : 'src'}));
