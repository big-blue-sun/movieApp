import SQLite from 'react-native-sqlite-storage'


export class BaseManager {
    constructor() {
        this.sqlite = SQLite;
        this.sqlite.DEBUG(true);
        this.sqlite.enablePromise(true);
        this.sqlite.openDatabase({
            name: "movieApp",
            location: "Documents"
        }).then((db) => {
            this.dbInstance = db;
        })
    }


    createTable() {
        return new Promise((resolve, reject) => {
            this.dbInstance.executeSql(
                "CREATE TABLE favMovie (id INTEGER PRIMARY KEY NOT NULL,movieid TEXT);"
            ).then((val) => {
                resolve(true)
            }).catch((err) => {
                if (err.code == 5) {
                    reject("zatenvar")
                } else {
                    reject("false")

                }


            })
        });
    }

    addfavMovie(id) {
        return new Promise((resolve, reject) => {
            this.dbInstance.executeSql(
                `INSERT INTO favMovie (movieid) VALUES('${id}');`

            ).then((val) => {

                resolve(true);
            }).catch((err) => {
                console.log(err);
                reject(false);
            })

        });
    }

    getfavMovie (){


        return new Promise((resolve, reject) => {
            this.dbInstance.executeSql(
                "SELECT * FROM favMovie"
            ).then(([values]) => {
                var array = [];
                for (let index = 0; index < values.rows.length; index++) {
                    const element = values.rows.item(index);
                    array.push(element);
                }
                resolve(array);
            }).catch((err) => {
                reject(false);
            })

        });


    }

    

    removefavMovie (id) {
   
        return new Promise((resolve, reject) => {
            this.dbInstance.executeSql(
                `DELETE FROM favMovie WHERE movieid='${id}'`
            ).then((val) => {
                resolve(true);
            }).catch((err) => {
                reject(false);
            })

        });
    }

    removeTable () {
   
        return new Promise((resolve, reject) => {
            this.dbInstance.executeSql(
             "DELETE FROM favMovie"
            ).then((val) => {
                resolve(true);
            }).catch((err) => {
                reject(false);
            })

        });
    }
   



}