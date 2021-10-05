import { Database, IDbColumn } from './sql/sqlite';
import * as express from 'express'
import * as cors from 'cors';

export interface ISqlRequestBody {
    tableName: string;
    columns:IDbColumn[];
    payload?:any;
}

export interface IByAction {
    key:string;
    value:any
}

const server = express();
const port = 62450;
const database = new Database();

server.use(cors());
server.use(express.json({
    limit: "100mb"
}));

server.get('/', (req, res) => {
    res.send("Running");
});

server.post('/sql/table/create', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.create();
    res.send(data);
});

server.post('/sql/table/exists', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.exists();
    res.send(data);
});

server.post('/sql/table/items/delete', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.delete(body.payload);
    res.send(data);
});

server.post('/sql/table/items/deleteBy', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const by = body.payload as IByAction;
    const data = table.deleteBy(by.value, by.key);
    res.send(data);
});

server.post('/sql/table/items/insert', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.insert(body.payload);
    res.send(data);
});

server.post('/sql/table/items/insert-identity', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const keyName = body.columns.find(w => w.isPrimaryKey === true)?.name ?? "";
    const max = table.maxBy(keyName);
    const nextId = (max.Max ?? 0) + 1;

    body.payload[keyName] = nextId;

    const data = table.insert(body.payload);
    res.send(data);
});

server.post('/sql/table/items/find', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.find(body.payload);
    res.send(data);
});

server.post('/sql/table/items/findBy', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const by = body.payload as IByAction;
    const data = table.findBy(by.value, by.key);
    res.send(data);
});

server.post('/sql/table/items/all', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const all = table.all();
    res.send(all.filter(w => w != null));
});

server.post('/sql/table/items/allBy', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const by = body.payload as IByAction;
    const all = table.allBy(by.value, by.key);
    res.send(all.filter(w => w != null));
});

server.post('/sql/table/items/maxBy', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const by = body.payload as IByAction;
    const data = table.maxBy(by.value);
    res.send(data);
});

server.post('/sql/table/items/update', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.update(body.payload);
    res.send(data);
});

server.post('/sql/table/items/updateBy', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.updateBy(body.payload.item, body.payload.by.value, body.payload.by.key);
    res.send(data);
});

server.post('/sql/table/items/updateMany', (req, res) => {
    const body = req.body as ISqlRequestBody;
    const table = database.connectTo(body.tableName, body.columns);
    const data = table.updateMany(body.payload);
    res.send(data);
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`)
})
  