import sqlite3 from "sqlite3";

export default function simpleSqlite(databaseName) {
    // Connect to DB
    const db = new sqlite3.Database(`./${databaseName}.db`, sqlite3.OPEN_READWRITE, err => {
        if(err) return console.error(err.message);
    });

    const createTable = (tableName, columns, options) => {
        if(!options) {
            options = {
                autoId: true,
            }
        }
        
        if(!options.autoId) {
            if(!options.primaryKey) return console.error("Error: no specified primary key");

            let arrColumns = columns.split(",");
            let newColumns = arrColumns.filter(col => {
                return col != options.primaryKey;
            });

            const primaryKeyIndex = arrColumns.findIndex(col => col == options.primaryKey);
            newColumns.splice(primaryKeyIndex, 0, `${arrColumns[primaryKeyIndex]} PRIMARY KEY`);
            newColumns.join(",");
            columns = [...newColumns].join(",");
        } else {
            let str = "id INTEGER PRIMARY KEY";
            let newColumns = columns.split(",");
            newColumns.unshift(str);
            columns = [...newColumns].join(",");
        }

        db.run(`CREATE TABLE IF NOT EXISTS ${tableName}(${columns})`, (err) => {
            if(err) return console.error(err.message);
        });
    }

    const dropTable = (tableName) => {
        db.run(`DROP TABLE ${tableName}`);
    }

    const insertData = (tableName, data) => {
        let columns = [];
        let values = [];
        let params = [];

        for(let prop in data) {
            columns.push(prop);
            values.push(data[prop]);
        }
        
        for(let i = 0; i < values.length; i++) {
            params.push("?");
        }
        
        db.run(`INSERT INTO ${tableName}(${columns.join(",")}) VALUES (${params.join(",")})`, values, err => {
            if(err) return console.error(err.message);
        });
    }

    const updateData = (tableName, data, condition) => {
        let columns = [];
        let values = [];

        for(let prop in data) {
            let str = `${prop} = ?`;
            columns.push(str);
            values.push(data[prop]);
        }
        
        db.run(`UPDATE ${tableName} SET ${columns.join(",")} WHERE ${condition}`, values, err => {
            if(err) return console.error(err.message);
        });
    }

    const selectAll = (tableName, callback) => {
        db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
            if(err) return console.error(err.message);
            if(typeof callback == "function"){
                callback(rows);
            }
        });
    }

    const selectOne = (tableName, condition, callback) => {
        db.all(`SELECT * FROM ${tableName} WHERE ${condition}`, [], (err, rows) => {
            if(err) return console.error(err.message);
            if(typeof callback == "function") {
                callback(rows);
            }
        })
    }

    const deleteOne = (tableName, condition) => {
        db.run(`DELETE FROM ${tableName} WHERE ${condition}`, [], err => {
            if(err) return console.error(err.message);
        })
    }

    return {
        createTable,
        dropTable,
        insertData,
        updateData,
        selectAll,
        selectOne,
        deleteOne
    }
}