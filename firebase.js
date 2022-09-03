import { clearScreen, displayMessage, permissionDenialModal } from "./messenger.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-app.js";
import { connectFirestoreEmulator, getFirestore, collection, doc, setDoc, onSnapshot, query, Timestamp, orderBy } from "https://www.gstatic.com/firebasejs/9.9.2/firebase-firestore.js";
import { initializeAppCheck, getToken } from "https://cdnjs.cloudflare.com/ajax/libs/firebase/9.9.2/firebase-app-check.min.js";

class Message {
    constructor(sender, message, timestamp) {
        this.sender = sender;
        this.message = message;
        this.timestamp = timestamp;
    }
    toString() {
        return this.sender + ' sent ' + this.message + ' at ' + this.timestamp;
    }
}
const messageConverter = {
    toFirestore: (content) => {
        return {
            sender: content.sender,
            message: content.message,
            timestamp: content.timestamp
        };
    },
    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Message(data.sender, data.message, data.timestamp);
    }
}

export class Firestore {
    #firebaseConfig = {
        // apiKey: "AIzaSyAAPZSWpQD6MVKhWGA9ZhuQBHBXlYyrPGI",
        // authDomain: "dt-web-chat.firebaseapp.com",
        // projectId: "dt-web-chat",
        // storageBucket: "dt-web-chat.appspot.com",
        // messagingSenderId: "225322971644",
        // appId: "1:225322971644:web:c683eb0a362e55f44a8279",
        // measurementId: "G-909ZY9T869"
        apiKey: "AIzaSyCXpbTwk85O8WdHnMDy6BlQYY_8hZhi8xI",
        authDomain: "dt-chat-382db.firebaseapp.com",
        projectId: "dt-chat-382db",
        storageBucket: "dt-chat-382db.appspot.com",
        messagingSenderId: "335861675650",
        appId: "1:335861675650:web:0e7699c3d9be6015e4a69b"
    };
    constructor(collectionName) {
        this.app = initializeApp(this.#firebaseConfig);
        this.db = getFirestore(this.app);
        this.collection = collection(this.db, collectionName);
        this.doc = doc(this.collection);
        
        // this.appCheck();
        this.setupEmulator();
        
        this.unsubscribeListener = null;
        this.subscribe();
    }
    appCheck() {
        const appCheck = initializeAppCheck(
            this.app, { provider: ReCaptchaV3Provider } // ReCaptchaV3Provider or CustomProvider
        );
    }
    setupEmulator() {
        connectFirestoreEmulator(this.db, 'localhost', 8080);
    }
    async storeMessage(message, user) {
        try {
            const ref = this.doc.withConverter(messageConverter);
            await setDoc(ref, new Message(user.phone, message, Timestamp.now()));
        } catch(err) {
            throw err;
        }
    }
    subscribe() {
        const recentMessagesQuery = query(this.collection, orderBy("timestamp", "asc"));
        this.unsubscribeListener = onSnapshot(recentMessagesQuery.withConverter(messageConverter), function(snapshot) {
            snapshot.docChanges().forEach(function(change) {
                var message = change.doc.data();
                // console.log(message.toString(), new Date(message.timestamp.seconds*1000));
                // console.log(change.doc._document.readTime.timestamp.seconds)
                // if (!change.doc.metadata.hasPendingWrites) {
                displayMessage(message);
                // }
            });
        }, function(err) {
            permissionDenialModal(err.code.toUpperCase());
            // console.log(err)
        });
    }
    unsubscribe() {
        try {
            // this.unsubscribeListener();
            this.unsubscribeListener = null;
        } catch(err) {
            console.log(err);
        }
    }
}


// re-captcha3
// site key: 6LehkswhAAAAAPkTI28yLFw65UiKjNcYJB6GG7V6
// secret key: 6LehkswhAAAAAIxMNwUeu1mg1CXKNY30bPd6d4Yb