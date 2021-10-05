import { DataStore } from "./fs-data-store";

const ds = new DataStore("C:\\users\\jamesdemeuse\\");

const test = async () => {
    const index = ds.connectTo("append");
    const item = {
        id: -1,
        name: "James DeMeuse"
    }

    await index.create(item, "id");
    await index.update({
        id: 10,
        name: "COOL2!!"
    }, "id");

    await index.delete(11);
    await index.all();

    const found = await index.find(10);
    console.log(found);
}

test();