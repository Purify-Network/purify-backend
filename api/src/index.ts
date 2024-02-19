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


//TODO UPLOAD IMAGE METHOD


app.post('/new-loc', async (req: Request, res: Response) => {
  // TODO UPLOAD IMAGE AND SAVE FILE PATH TO PUSH HERE TO DB
  try {
    let name = req.body.name;
    let image_path = req.body.image_path;
    let lat = req.body.latitude;
    let lng = req.body.longitude;
    let epoch = req.body.epoch;

    let sql = `INSERT INTO water_locs (name, image_path, latitude, longitude, epoch_added) VALUES '${name}', '${image_path}', ${lat}, ${lng}, ${epoch};`;
    const res = await client.query(sql);

    } catch (error) {
      return res.status(500).json({ error: 'Error adding new location' });
  }
});


app.post('/new-test', async (req: Request, res: Response) => {
  try {
    let ph = req.body.ph;
    let tds = req.body.tds;
    let temp = req.body.temp;
    // ????? TODO ????? image path if we want to verify the person is actually at the water source via image taken and AI?
    let locid = req.body.locid;
    let userid = req.body.userid;
    let epoch = req.body.epoch;
    
    let sql = `INSERT INTO water_tests (user_id, loc_id, temperature, ph, tds, epoch) VALUES ${userid}, ${locid}, ${temp}, ${ph}, ${tds}, ${epoch};`;
    const res = await client.query(sql);

    } catch (error) {
      return res.status(500).json({ error: 'Error updating scores.' });
  }
});


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
      return res.send({success: "success"});
    }else{
      return res.status(500).json({ error: 'Wrong sign up info, moron' });
    }
  } catch (error) {
	  console.log(error);
      return res.status(500).json({ error: 'Error signing up.' });
  }
});


app.post('/login', async (req: Request, res: Response) => {
  try {
    const epoch = 0;//req.body.epoch_created;
    //let x = encrypt.decryptLoginDataAES(epoch, msg);
    //let json = JSON.parse(x);
    const username = req.body.username; //json.username;
    const password = req.body.password; //json.password;

    const loginMatch = await login(username, password).then(value => {return value;});
    if(loginMatch == 1){
      const login_token = make_login_token(48);
      let sql = `UPDATE users SET login_token='${login_token}', epoch=${epoch} WHERE username='${username}';`;
      const res2 = await client.query(sql);
      return res.send({login_token: login_token});
    }else{
      return res.status(500).json({ error: 'Wrong login info, moron' });
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


async function login(username: string, password: string, epoch_created: number): Promise<number> {
  try {
    // TODO ADD WHEN USER LOGGED IN WITH THE EPOCH    
    let sql = `SELECT username from users WHERE username='${username}' AND password='${password}';`;
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
