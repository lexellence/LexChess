import { Firebase } from '../Firebase';
import { ref, get } from "firebase/database";

//+--------------------------------\--------------------------
//|	     getGameFromDatabase   	   |
//\--------------------------------/--------------------------
async function getGameFromDatabase(gid: string, firebase: Firebase) {
    return new Promise(function (resolve, reject) {
        // Get game from local storage if saved
        const savedGameString = localStorage.getItem('GameHistoryPageProvider::' + gid);
        if (savedGameString) {
            resolve(JSON.parse(savedGameString));
        }
        else {
            // Get game from server
            get(ref(firebase.db, `games/${gid}`)).then((snapshot: any) => {
                if (snapshot.exists()) {
                    const gameString = JSON.stringify(snapshot.val());
                    localStorage.setItem('GameHistoryPageProvider::' + gid, gameString);
                    resolve(snapshot.val());
                }
                else
                    reject();
            });
        }
    });
}

export { getGameFromDatabase };
