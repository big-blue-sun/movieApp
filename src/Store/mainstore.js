import { observable, makeObservable, autorun,configure } from 'mobx'
import AS from "@react-native-async-storage/async-storage"
configure({ enforceActions: "never" });
class MainStore {
    @observable favMovie = "";
    constructor() {
        makeObservable(this)
        autorun(async () => {
            AS.getItem("firstRun").then(async (res) => {
                if (res == null || res == "") {
                    AS.setItem("firstRun", "true")
                    AS.setItem("likeMovie", "")
                } else {
                    AS.getItem("likeMovie").then((res) => {
                        this.favMovie = res != null ? res : ""
                    })
                }
            }).catch((err) => {
                alert(err)
            })
        })
    }
}
export default new MainStore();