import express from 'express';
import fs from 'fs';
import path from 'path';
import { Octokit } from '@octokit/rest';

const app = express();
app.use(express.json());
app.use(express.static('.'));

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'XxXAndresSuarezXxX';
const REPO_NAME = 'Migraci-n-ADS-Diagrama';
const FILE_PATH = 'estado.json';
const octokit = new Octokit({ auth: GITHUB_TOKEN });

app.post('/guardar', async (req,res)=>{
  try {
    const nuevoContenido = JSON.stringify(req.body, null, 2);
    const { data } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH
    });
    const sha = data.sha;
    await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: FILE_PATH,
      message: 'Actualización automática del estado',
      content: Buffer.from(nuevoContenido).toString('base64'),
      sha
    });
    res.json({ok:true});
  } catch (err) {
    console.error(err);
    res.status(500).json({error:'No se pudo guardar'});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>console.log('Servidor corriendo en puerto', PORT));
