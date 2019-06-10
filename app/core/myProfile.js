var profileCore =
{
    async displayUserInfo()
    {
        console.log("Dsad");
        let userData = await loginFirebase.getUserData(firebase.auth().currentUser.uid);
        console.log(userData);
        $("#profImage").attr("src", !!userData.imageUrl.upload ? userData.imageUrl.upload : userData.imageUrl.email);
        $("#profUserName").text(userData.givenName + " " + userData.familyName);
    }
}

profileCore.displayUserInfo();