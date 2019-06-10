// Initialize Firebase
var config = {
    apiKey: "AIzaSyDc3dUvquXS2rVitIHklKo1kWYYUQiHXJI",
    authDomain: "shopndeal-d0788.firebaseapp.com",
    databaseURL: "https://shopndeal-d0788.firebaseio.com",
    projectId: "shopndeal-d0788",
    storageBucket: "shopndeal-d0788.appspot.com",
    messagingSenderId: "77930100959"
};
firebase.initializeApp(config);

const db = firebase.firestore();
const firestore = firebase.firestore();

var fbProvider = new firebase.auth.FacebookAuthProvider();
fbProvider.setCustomParameters({
    display: "popup"
});

const gProvider = new firebase.auth.GoogleAuthProvider();
gProvider.addScope("https://www.googleapis.com/auth/contacts.readonly");


let varrealtimeComment;



var loginFirebase = {
    authLogin(provider) {
        return firebase
            .auth()
            .signInWithPopup(provider)
            .then(function (result) {
                return result
            })
            .catch(function (error) {
                console.log(error);
                return false
            });
    },

    createNewUser(result) {
        console.log(result);
        let lastName = typeof (result.additionalUserInfo.profile.family_name) !== 'undefined' ? result.additionalUserInfo.profile.family_name : result.additionalUserInfo.profile.last_name;
        let firstName = typeof (result.additionalUserInfo.profile.given_name) !== 'undefined' ? result.additionalUserInfo.profile.given_name : result.additionalUserInfo.profile.first_name;
        let imageUrl = typeof result.additionalUserInfo.profile.picture.data !== 'undefined' ? result.additionalUserInfo.profile.picture.data.url : result.user.photoURL;

        db.collection("users")
            .doc(result.user.uid)
            .set({
                familyName: lastName,
                givenName: firstName,
                email: result.user.email,
                phoneNumber: result.user.phoneNumber,
                lastSignInTime: result.user.metadata.lastSignInTime,
                imageUrl: {
                    email: imageUrl,
                    upload: ""
                },
                notifToken: "",
                rating: 0,
                trustful: 0,
                untrustful: 0,
                noUserWhoRate: 0,
                timeStamp: firebase.firestore.Timestamp.fromDate(new Date())
            })
            .then(function () {

                console.log("Document successfully written!");
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });
    },

    checkEmailExists(email) {
        return db.collection("users").where("email", "==", email).get()
            .then(doc => {

                return doc.empty
            })
            .catch(error => console.log("ERROR: " + error))
    },

    createManualAccount(email, password) {
        console.log("PASOK!");
        return firebase.auth().createUserWithEmailAndPassword(email, password)
            .then(function (result) {
                return [true, result.user.uid]
            })
            .catch(function (error) {
                // Handle Errors here.
                console.error(error);
                return false
                // ...
            });
    },

    loginManual(email, password) {
        console.log(email);
        return firebase.auth().signInWithEmailAndPassword(email, password)
            .then(result => {
                console.log(result);
                return true
            })
            .catch(function (error) {
                console.log(error);
                if (error.code == "auth\/user-not-found") {
                    alert("Email is not registered");
                } else if (error.code == "auth\/invalid-email") {
                    alert("Email is badly formatted!");
                } else if (error.code == "auth\/wrong-password") {
                    alert("Wrong Password or email does not have password");
                }
                return false
            });
    },

    updatePass(newPass) {
        let user = firebase.auth().currentUser;

        return user.updatePassword(newPass).then(function () {
            return true
        }).catch(function (error) {
            // An error happened.
            console.error("ERROR: " + error);
            return false
        });
    },

    sendVerification() {
        let user = firebase.auth().currentUser;

        user.sendEmailVerification().then(function () {
            console.log("Email Verification is sent!");
        }).catch(function (error) {
            // An error happened.
            console.log("ERROR: " + error);
        });
    },

    logout() {
        firebase.auth().signOut().then(() => {
            // Sign-out successful.
            console.log("Succes Logout!");
            return true
        }).catch(function (error) {
            // An error happened.
            console.log(error);
            return false
        });
    },


    sendPasswordResetEmail(email) {
        var auth = firebase.auth();
        return auth.sendPasswordResetEmail(email).then(function () {
            // Email sent.
            alert("Successfully sent a reset password on your email");
            return true
        }).catch(function (error) {
            // An error happened.
            console.error("ERROR: " + error);
            return false
        });
    },

    isUserLogin() {
        var user = firebase.auth().currentUser;

        if (user) {
            return true
        } else {
            return false
        }
    },


    uploadDropImg(selectedFile) {
        var filename = selectedFile.name;
        let extension = filename.replace(/.+\./, ""),
        newname = String(firebase.firestore.Timestamp.fromDate(new Date()).seconds);

        
        filename = newname + "." + extension;
        console.log(filename);

        var storageRef = firebase.storage().ref('/itemImages/' + filename);
        var metadata = {
            contentType: 'tempimage/jpeg',
        };

        var uploadTask = storageRef.put(selectedFile, metadata);

       return new Promise(resolve => {
            return uploadTask.on('state_changed', function(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                    case firebase.storage.TaskState.PAUSED: // or 'paused'
                        console.log('Upload is paused');
                        break;
                    case firebase.storage.TaskState.RUNNING: // or 'running'
                        console.log('Upload is running');
                        break;
                }
            },
            function(error) {
                console.log("Error: ", error);
                resolve(false);
            },
            function() {

                uploadTask.snapshot.ref.getDownloadURL().then(function(downloadURL) {

                    // reset the file input
                   // event.target.value = null;

                    resolve({ 
                        doc: newname,
                        url: downloadURL,
                        name: filename
                    })
                })
            });
       }) 
    },






    realTimeCheckLogin: firebase.auth().onAuthStateChanged(async function (user) {
        if (user) {
            console.log(user);
            subTask.logined();
            let userData = await loginFirebase.getUserInfo(user.uid);
            $(".userDp").attr("src", !!userData.imageUrl.upload ? userData.imageUrl.upload : userData.imageUrl.email);
            $(".userFullName").text(userData.givenName + " " + userData.familyName);
        } else {
            subTask.notLogin();
            console.log("user is signout!");
        }
        $('.tabs').tabs('updateTabIndicator');
    }),

    realTimeComment(userId)
    {
        varrealtimeComment = db.collection("users").doc(userId).collection("comment").orderBy("timeStamp")
        .onSnapshot(function (comments) {
            comments.docChanges().forEach(async function (comment) {

                if (comment.type == "added")
                {
                     let commentsData = comment.doc.data();
                     commentsData.id = comment.doc.id;

                     let userCommentData = await loginFirebase.getUserData(commentsData.userId);
                     $("#sellerComments").append(`
                         <div class="cu" id="comment${comment.doc.id}">
                             <div class="col s12 font-2"> ${userCommentData.givenName + " " + userCommentData.familyName}</div>
                             <div class="col s12 grey-text font-2"> <span>${mainTask.getTimeAgo(firebase.firestore.Timestamp.fromDate(new Date()), commentsData.timeStamp)}</span></div>
                             <div class="col s12 color-default p-1 font-3 mb-4 br-1 grey lighten-2">${commentsData.message}</div>
                         </div>
                     `);
                }
                else if (comment.type == "removed") {
                    $("#comment" + comment.doc.id).remove();
                }
            });
        })
    },









    imageAdd(image)
    {
         // add it to database!
        return db.collection("ItemImages").doc(String(image.doc)).set({
            name: image.name,
            url: image.url
        })
        .then(function() {
            console.log("Document successfully written!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },

    addProduct(productData)
    {
        console.log(productData);
        return db.collection("items").doc().set({
            bid: productData.bid,
            imageDoc: productData.imageDoc,
            itemName: productData.itemName,
            price: Number(productData.price), 
            description: productData.description, 
            ondeal: false,
            sold: false,
            tags: productData.tags,
            timeStamp: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: firebase.auth().currentUser.uid,
            offer: 0
        })
        .then(function() {
            console.log("Document successfully written!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },

    addComment(commentData)
    {
        return db.collection("users").doc(commentData.beingComment).collection("comment").doc()
        .set({
            message: commentData.message,
            timeStamp: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: commentData.userId
        }).then(() => {
            return true
        }).catch(error => {
            console.error("ERROR: " , error);
            return false
        })
    },

    addUserRate(rate, trust, userId)
    {
        return db.collection("users").doc(userId).collection("rating").doc().set({
            rating: rate,
            trustful: trust,
            userId: firebase.auth().currentUser.uid,
            timeStamp: firebase.firestore.Timestamp.fromDate(new Date())
        }).then(() => {
            return true
        }).catch(error => { console.log("ERROR: ", error); return false })
    },

    makeOffer(userOffer, bid, itemId)
    {
        return db.collection("bids").doc().set({
            amount: userOffer,
            ondeal: false,
            bid: bid,
            itemId: itemId,
            timeStamp: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: firebase.auth().currentUser.uid,
            sucTransac: {buyer: false, seller: false},
            complete: false
        }).then(() => {
            return true
        }).catch(error => { console.log("ERROR: ", error); return false })
    },

    addMessages(message, bidId, sellerInp)
    {
        return db.collection("bids").doc(bidId).collection("messages").doc().set({
            message: message,
            normal: true,
            timeStamp: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: firebase.auth().currentUser.uid,
            seller: sellerInp == "true" ? true : false
        }).then(() => {
            return true
        }).catch(error => { console.log("ERROR: ", error); return false })
    },

    addTransacHistory(history)
    {
        return db.collection("transacHistory").doc().set(history).then(() => {
            return true
        }).catch(error => { console.log("ERROR: ", error); return false })
    },

    addWatchList(itemId, userId)
    {
        return db.collection("watchList").doc().set({
            itemId: itemId,
            userId: userId
        }).then(() => {
            return true
        }).catch(error => { console.log("ERROR: ", error); return false })
    },
    



    async updateOfferInItem(itemId, addMinus)
    {   let productInfo = await loginFirebase.getItemInfo(itemId);
        return db.collection("items").doc(itemId).update({
            offer: addMinus == "add" ? productInfo.offer + 1 : productInfo.offer - 1
        }).then(() => {
            return true
        }).catch(error => { console.log("ERROR: ", error); return false })
    },

    editProduct(productData)
    {
        console.log(productData);
        return db.collection("items").doc(productData.id).update({
            bid: productData.bid,
            imageDoc: productData.imageDoc,
            itemName: productData.itemName,
            price: productData.price, 
            description: productData.description, 
            sold: false,
            tags: productData.tags,
            timeStamp: firebase.firestore.Timestamp.fromDate(new Date()),
            userId: firebase.auth().currentUser.uid
        })
        .then(function() {
            console.log("successfully update product!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },

    ondealItem(itemId, val)
    {
        return db.collection("items").doc(itemId).update({
            ondeal: val
        })
        .then(function() {
            console.log("successfully ondeal!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },

    ondealBid(bidID, val)
    {
        return db.collection("bids").doc(bidID).update({
            ondeal: val
        })
        .then(function() {
            console.log("successfully ondeal!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },

    updateSucTransac(bidId, sellerInp)
    {
        return db.collection("bids").doc(bidId).update({
            [sellerInp == "true" ? "sucTransac.seller" : "sucTransac.buyer"]: true
        })
        .then(function() {
            console.log("successfully!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },

    updateSoldItem(itemId)
    {
        return db.collection("items").doc(itemId).update({
            sold: true
        })
        .then(function() {
            console.log("successfully ondeal!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },

    updateBidComplete(bidId)
    {
        return db.collection("bids").doc(bidId).update({
            complete: true
        })
        .then(function() {
            console.log("successfully!");
            return true
        })
        .catch(function(error) {
            console.error("Error writing document: ", error);
            return false
        });
    },



    getMyWatchList(userId)
    {
        return db.collection("watchList").where("userId", "==", userId).get().then(watchLists => {
            let watchsLists = [];
            watchLists.forEach(watch =>
            {
                let watchList = watch.data();
                watchList.id = watch.id;
                watchsLists.push(watchList);
            })
            return watchsLists
        }).catch(error => console.log("ERROR: ", error))
    },

    getBidData(bidId)
    {
        return db.collection("bids").doc(bidId).get().then(bid => {
            return bid.data();
        })
    },

    getUserInfo(id)
    {
        return db.collection("users").doc(id).get().then(user => {
            return user.data();
        })
    },

    getUserProductsSize()
    {
        return db.collection("items").where("userId", "==", firebase.auth().currentUser.uid).get()
        .then(items => {
            return items.size
        })
        .catch(error => console.log("ERROR: " + error))
    },

    getImageData(imageDoc)
    {
        return db.collection("ItemImages").doc(imageDoc).get()
        .then(image => {
            if(image.exists){
                let imageData = image.data();
                imageData.id = image.id;
                return imageData;
            }
            else
            {
                return false
            }
        })
        .catch(error => console.log("ERROR: " + error))
    },

    getNumberOfBid(itemId)
    {
        return db.collection("bids").where("itemId", "==", itemId).get()
        .then(bids => {
            return bids.size
        })
        .catch(error => console.log("ERROR: " + error))
    },

    getItemInfo(itemId)
    {
        return db.collection("items").doc(itemId).get()
        .then(item => {
            let itemData = item.data();
            itemData.id = item.id;
            return itemData
        })
        .catch(error => console.log("ERROR: " + error))
    },

    getUserData(uid)
    {
        return db.collection("users").doc(uid).get()
        .then(user => {
            let userData = user.data();
            userData.id = user.id;
            return userData
        })
        .catch(error => console.log("ERROR: " + error))
    }, 

    getFeaturedProducts()
    {
        return db.collection("items").orderBy("offer", "desc").limit(8).get().then(items => 
        {
            let itemsDatas = [];
            items.forEach(item => 
            {
                let itemData = item.data();
                itemData.id = item.id;
                itemsDatas.push(itemData);
            })
            return itemsDatas
        })
    },

    getNewProducts()
    {
        return db.collection("items").orderBy("timeStamp", "desc").limit(8).get().then(items => 
        {
            let itemsDatas = [];
            items.forEach(item => 
            {
                let itemData = item.data();
                itemData.id = item.id;
                itemsDatas.push(itemData);
            })
            return itemsDatas
        })
    },

    getSearchProduct(search)
    {
        return db.collection("items").where("tags", "array-contains", search).get()
        .then(items => {
            let itemsDatas = [];
            items.forEach(item => {
                let itemData = item.data();
                itemData.id = item.id;
                itemsDatas.push(itemData);
            })
            return itemsDatas
        }).catch(error => console.log("ERROR: ", error))
    },
    
    getItemOffer(itemId)
    {
        return db.collection("bids").where("itemId", "==", itemId).orderBy("amount", "desc").get()
        .then(offers => {
            let offersDatas = [];
            offers.forEach(offer => {
                let offerData = offer.data();
                offerData.id = offer.id;
                offersDatas.push(offerData);
            })
            return offersDatas
        }).catch(error => console.error("ERROR: ", error))
    },

    getUserOfferOdeal()
    {
        return db.collection("bids").where("userId", "==", firebase.auth().currentUser.uid)
        .where("ondeal", "==", true).where("complete", "==", false).get().then(bids => {
            let userbids = [];
            bids.forEach(bid =>
            {
                let userBid = bid.data();
                userBid.id = bid.id;
                userbids.push(userBid);
            })
            return userbids
        }).catch(error => console.log("ERROR: ", error))
    },

    getUserItemsNotSold()
    {
        return db.collection("items").where("userId", "==", firebase.auth().currentUser.uid).where("sold", "==", false).get()
        .then(items => {
            let itemsDatas = [];
            items.forEach(item =>
            {
                let itemData = item.data();
                itemData.id = item.id;
                itemsDatas.push(itemData);
            })
            return itemsDatas
        })
    },

    getUserDeals(itemID)
    {
        console.log(itemID);
        return db.collection("bids").where("itemId", "==", itemID).where("ondeal", "==", true).get()
        .then(bids => {
            let bidsDatas;
            bids.forEach(bid =>
            {
                let bidData = bid.data();
                bidData.id = bid.id;
                bidsDatas = bidData;
            })
            return bidsDatas;
        })
    },

    getTransactionHistory(userId)
    {
        return db.collection("transacHistory").where("userId", "==", userId).get()
        .then(transactions => {
            let transactionsDatas = [];
            transactions.forEach(transaction =>
            {
                let transactionData = transaction.data();
                transactionData.id = transaction.id;
                transactionsDatas.push(transactionData);
            })
            return transactionsDatas;
        })
    },




    removeWatchList(id)
    {
        return db.collection("watchList").doc(id).delete().then(() => {
            return true
        }).catch(error => console.error("ERROR: " + error))
    },

    deleteProduct(id)
    {
        return db.collection("items").doc(id).delete().then(() => {
            return true
        }).catch(error => console.error("ERROR: " + error))
    },

    deleteImage(strImageRef)
    {
        var imageRef = firebase.storage().ref(strImageRef);
        return imageRef.delete().then(function() {
            // File deleted successfully
            return true
        }).catch(function(error) {
            // Uh-oh, an error occurred!
            console.error("ERROR: " + error);
            return false
        });
    },

    deleteImageBase(id)
    {
        return db.collection("ItemImages").doc(id).delete().then(function() {
            // File deleted successfully
            return true
        }).catch(function(error) {
            // Uh-oh, an error occurred!
            console.error("ERROR: " + error);
            return false
        });
    },

    cancelOffer(bidId)
    {
        return db.collection("bids").doc(bidId).delete()
        .then(function() {
            return true
        }).catch(function(error) {
            console.error("ERROR: " + error);
            return false
        });
    }
}


