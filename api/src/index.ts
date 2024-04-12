// src/index.js
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Client } from 'pg';
//import { https } from 'https';
//import { fs } from 'fs';
import * as fs from 'fs';
import * as https from 'https';
import multer from 'multer';

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



const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const imageUpload = multer({ storage: storage });



const app: Express = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static('./public'));
//app.use("/uploads", express.static('.././uploads'));


app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});


//TODO UPLOAD IMAGE METHOD
//app.post('/upload-image', async (req: Request, res: Response) => {
app.post('/upload-image', imageUpload.single("image12"), (req, res) => {
  console.log(req.body);
  console.log(req.body.hello);
  console.log(req.files);
  console.log(req.body.name);
  console.log('POST request received to /image-upload.');
  console.log('Axios POST body: ', req);
  res.send('POST request recieved on server to /image-upload.');
})



app.get('/loc', async (req: Request, res: Response) => {
  // TODO UPLOAD IMAGE AND SAVE FILE PATH TO PUSH HERE TO DB
  try {
    let locid = req.query.locid;
    let sql = `SELECT * FROM water_locs WHERE id=${locid};`;
    const res2 = await client.query(sql);
    return res.send(res2.rows);
    } catch (error) {
      return res.status(500).json({ error: 'Error getting location' });
  }
});


app.get('/stats', async (req: Request, res: Response) => {
  try {
    const username = req.query.username;
    const res2 = await client.query(`SELECT tests_made, locs_added, points, unique_locs_tested FROM users WHERE username='${username}';`);
    const tests_made = res2.rows[0].tests_made;
    const locs_added = res2.rows[0].locs_added;
    const points = res2.rows[0].points;
    const unique_locs_tested = res2.rows[0].unique_locs_tested;
    return res.send({tests_made: tests_made, locs_added: locs_added, points: points, unique_locs_tested: unique_locs_tested});
  } catch (error) {
      return res.status(500).json({ error: 'Error getting player stats.' });
  }
});


app.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const res2 = await client.query("SELECT points, username FROM users ORDER BY points DESC;");
    return res.send(res2.rows);
  } catch (error) {
      return res.status(500).json({ error: 'Error getting leaderboard' });
  }
});


app.get('/total-tests', async (req: Request, res: Response) => {
  try {
    const res2 = await client.query("SELECT COUNT(id) FROM water_tests;");
    console.log(res2.rows);
    return res.send(res2.rows[0]);
  } catch (error) {
      return res.status(500).json({ error: 'Error getting leaderboard' });
  }
});


app.get('/total-locs', async (req: Request, res: Response) => {
  try {
    const res2 = await client.query("SELECT COUNT(id) FROM water_locs;");
    console.log(res2.rows);
    return res.send(res2.rows[0]);
  } catch (error) {
      return res.status(500).json({ error: 'Error getting leaderboard' });
  }
});


app.get('/total-users', async (req: Request, res: Response) => {
  try {
    const res2 = await client.query("SELECT COUNT(username) FROM users;");
    console.log(res2.rows);
    return res.send(res2.rows[0]);
  } catch (error) {
      return res.status(500).json({ error: 'Error getting leaderboard' });
  }
});


app.get('/locs-near-me', async (req: Request, res: Response) => {
  try {
    const radius = req.query.radius;
    console.log(radius);
    const lat = req.query.lat;
    console.log(lat);
    const lng = req.query.lng;
    console.log(lng);
    const maxLng = Number(lng) + Number(radius);
    const minLng = lng - radius;
    const maxLat = Number(lat) + Number(radius);
    const minLat = lat - radius;
    console.log(minLat);
    const sql = `SELECT id, latitude, longitude, name, image_path FROM water_locs WHERE latitude<${maxLat} AND latitude>${minLat} AND longitude<${maxLng} AND longitude>${minLng};`;
    const res2 = await client.query(sql);
    console.log(sql);
    return res.send(res2.rows);
  } catch (error) {
      return res.status(500).json({ error: 'Error getting nearby locs' });
  }
});


app.post('/new-loc', async (req: Request, res: Response) => {
  // TODO UPLOAD IMAGE AND SAVE FILE PATH TO PUSH HERE TO DB
  try {
    let name = req.body.name;
    let image_path = req.body.image_path;
    let lat = req.body.latitude;
    let lng = req.body.longitude;
    let epoch = req.body.epoch;

    let sql = `INSERT INTO water_locs (name, image_path, latitude, longitude, epoch_added) VALUES ('${name}', '${image_path}', ${lat}, ${lng}, ${epoch});`;
    const res2 = await client.query(sql);
    return res.send({success: "success"});
    } catch (error) {
      console.log(error);
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
    const res2 = await client.query(sql);
    return res.send({success: "success"});
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
    const name = "temp"; //req.body.name;
    const invited_by = req.body.invitedBy;

    const inserted = await sign_up(username, password, email, name, epoch_created, invited_by).then(value => {return value;});
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
	  console.log("here");
	console.log(req);
	  console.log(req.body);
	  console.log(req.body.username);
    const epoch = new Date().valueOf()/1000;//req.body.epoch_created;
    //let x = encrypt.decryptLoginDataAES(epoch, msg);
    //let json = JSON.parse(x);
    const username = req.body.username; //json.username;
    const password = req.body.password; //json.password;
console.log(username);
console.log(req.body);
    const loginMatch = await login(username, password).then(value => {return value;});
    if(loginMatch == 1){
	    console.log("1");
      const login_token = make_login_token(48);
      let sql = `UPDATE users SET login_token='${login_token}', epoch_last_login=${epoch} WHERE username='${username}';`;
      console.log(epoch);
      const res2 = await client.query(sql);
      console.log("2");
      return res.send({login_token: login_token});
    }else{
      return res.status(500).json({ error: 'Wrong login info, moron' });
    }
  } catch (error) {
          console.log(error);
      return res.status(500).json({ error: 'Error logging in' });
  }
});


//app.use(express.static(__dirname + '/public'));

/*

var privateKey = fs.readFileSync( './key.pem' );
var certificate = fs.readFileSync( './cert.pem' );

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
*/

const httpsOptions = {
  key: fs.readFileSync('./DO_private.key'),
  cert: fs.readFileSync('./DO_cert.cer')
}
const server = https.createServer(httpsOptions, app).listen(port, () => {
  console.log('server running at ' + port)
})


async function sign_up(username: string, password: string, email: string, name: string, epoch_created: number, invited_by: string): Promise<number> {
    try {
    let sql = `INSERT INTO users (email, username, password, name, login_token, invited_by, points) SELECT '${email}', '${username}', '${password}', '${name}', '', '${invited_by ? invited_by : ""}', ${invited_by ? 50 : 0}  WHERE NOT EXISTS (SELECT username FROM users WHERE username='${username}');`;
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
