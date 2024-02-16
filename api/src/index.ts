// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Client } from 'pg';

dotenv.config();

const client = new Client(
        {host: process.env.PG_HOST,
        port: 5432,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
        ssl: false}
);
client.connect();

const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});


app.post('/new-test', async (req: Request, res: Response) => {
  try {
    let username = req.body.ph;
    let lat = req.body.latitude;
    let lng = req.body.longitude;
    let epoch = req.body.epoch;
    
    let sql = " from users WHERE username='" + username + "';";
    const res = await client.query(sql);

    } catch (error) {
      return res.status(500).json({ error: 'Error updating scores.' });
  }
});


/*app.post('/new-user', async (req: Request, res: Response) => {
  try {
    let username = req.body.ph;
    let pub_key = req.body.tds;
    let lat = req.body.latitude;
    let lng = req.body.longitude;
    let epoch = req.body.epoch;
    let loginToken = req.body.loginToken;

    let sql = " from users WHERE username='" + username + "';";
    const res = await client.query(sql);

    } catch (error) {
      return res.status(500).json({ error: 'Error updating scores.' });
  }
});
*/


app.post('/signup', async (req: Request, res: Response) => {
  try {
	  console.log(req);
	  console.log(req.body);
    const epoch_created = 0;//req.body.epoch_created;
    //let x = encrypt.decryptLoginDataAES(epoch, msg);
    //let json = JSON.parse(x);
    const username = req.body.username; //json.username;
    const password = req.body.password; //json.password;
    const email = req.body.email; //json.email;
    const name = req.body.name;

    const inserted = await sign_up(username, password, email, name, epoch_created).then(value => {return value;});
    if(inserted > 0){
      const login_token = make_login_token(48);
      let sql = `UPDATE users SET login_token='${login_token}' WHERE username='${username}';`;
      const res2 = await client.query(sql);
      return res.send({login_token: login_token});
    }else{
      return res.status(500).json({ error: 'Wrong sign up info, moron' });
    }
  } catch (error) {
	  console.log(error);
      return res.status(500).json({ error: 'Error signing up.' });
  }
});



//app.use(express.static(__dirname + '/public'));

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});



async function sign_up(username: string, password: string, email: string, name: string, epoch_created: number): Promise<number> {
    try {
    let sql = `INSERT INTO users (email, username, password, name, epoch_created, login_token) SELECT '${email}', '${username}', '${password}', '${name}', ${epoch_created}, '' WHERE NOT EXISTS (SELECT username FROM users WHERE username='${username}');`;
    const res = await client.query(sql);
    return res.rowCount || -1;
    }catch (error) {
      console.log(error);
      return 0;
  }
}


function make_login_token(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    return result;
}
