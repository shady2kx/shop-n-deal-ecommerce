
$(".logined").addClass("hide");

var productOffers = [];

const preload1 = `<div class="preloader-wrapper big active">
<div class="spinner-layer spinner-blue">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-red">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-yellow">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-green">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>
</div>`;

const preload2 = `<div class="preloader-wrapper active">
<div class="spinner-layer spinner-blue">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-red">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-yellow">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-green">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>
</div>`;

const preload3 = `<div class="preloader-wrapper small active">
<div class="spinner-layer spinner-blue">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-red">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-yellow">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>

<div class="spinner-layer spinner-green">
  <div class="circle-clipper left">
    <div class="circle"></div>
  </div><div class="gap-patch">
    <div class="circle"></div>
  </div><div class="circle-clipper right">
    <div class="circle"></div>
  </div>
</div>
</div>`;

let realTimeAgoChat = [];
let realTimeChatData = [];


mainTask = {
    gLogin: $("#googleSignIn").click(async function () {
        let result = await loginFirebase.authLogin(gProvider);
        console.log(result);
        if (result != false) {
            result.additionalUserInfo.isNewUser ? loginFirebase.createNewUser(result) : console.log("User is not new");
            $('#signin').modal('close');
            $('#signup').modal('close');
        }
    }),

    fbLogin: $("#facebookSignIn").click(async function () {
        let result = await loginFirebase.authLogin(fbProvider);
        console.log(result);
        if (result != false) {
            result.additionalUserInfo.isNewUser ? loginFirebase.createNewUser(result) : console.log("User is not new");
            $('#signin').modal('close');
            $('#signup').modal('close');
        }
    }),

    manualLogin: $("#loginForm").submit(async function (event) {
        event.preventDefault();
        let success = await loginFirebase.loginManual($("#email").val(), $("#password").val())

        if (success) {
            // signInModal.close();
            $('#signin').modal('close');
            alert("You are now login");
        }
    }),

    signUp: $("#signupForm").submit(async function (event) {
        event.preventDefault();

        // THERE SHOULD BE DISABLE SUBMIT TO AVOID TWO SUBMIT

        if (!!$("#signEmail").val() && !!$("#signPass").val() && !!$("#fname").val() && !!$("#lname").val()) {
            let emailNotExist = await loginFirebase.checkEmailExists($("#signEmail").val());


            if (emailNotExist) {
                //[success, uid]
                let success = await loginFirebase.createManualAccount($("#signEmail").val(), $("#signPass").val());

                if (success[0]) {
                    let result = {
                        additionalUserInfo: {
                            profile: {
                                family_name: $("#fname").val(),
                                given_name: $("#lname").val(),
                                picture: {
                                    data: {
                                        url: ""
                                    }
                                }
                            },
                        },
                        user: {
                            email: $("#signEmail").val(),
                            phoneNumber: "",
                            metadata: {
                                lastSignInTime: firebase.firestore.Timestamp.fromDate(new Date())
                            },
                            uid: success[1]
                        }
                    }

                    loginFirebase.createNewUser(result);
                    loginFirebase.sendVerification();
                    alert("We sent you a verification link to verify your email");
                    $('#signup').modal('close');
                }
            } else {
                alert("Email is already registered");
            }
        } else {
            alert("Please fill up all form");
        }
    }),

    updatePass: $("#updatePass").click(async function () {
        let success = await loginFirebase.updatePass($("#newPass").val());
        if (success) {
            console.log("SUCCESS UPDATE password")
        }
    }),

    sendVerification: $("#sendVerification").click(function () {
        loginFirebase.sendVerification();
    }),

    logout: $("#logout").click(async function () {
        if (await loginFirebase.logout()); {
            subTask.notLogin();
        }
    }),

    signUpFrLogin: $("#signUpFrLogin").click(function () {
        $('#signin').modal('close');
        $('#signup').modal('open');
    }),

    loginFrSignUp: $("#loginFrSignUp").click(function () {
        $('#signin').modal('open');
        $('#signup').modal('close');
    }),

    forgotPassword: $("#forgotPassForm").submit(async function (event) {
        event.preventDefault();
        if (!!$("#resetPassEmail").val()) {
            let success = await loginFirebase.sendPasswordResetEmail($("#resetPassEmail").val());
            if (success) {
                $('#mdlForgotPass').modal('close');
            } else {
                alert("The password you entered is not registerd");
            }
        } else {
            alert("Please fill up the email field");
        }
    }),

    myProdocts() {
        let logined = loginFirebase.isUserLogin();
        if (logined) {
            subTask.logined();
        } else {
            subTask.notLogin();
        }
    },

    async viewProduct(itemId)
    {
        $("#productImages").html("");
        let itemData = await loginFirebase.getItemInfo(itemId),
        userData = await loginFirebase.getUserInfo(itemData.userId);
        userUid = firebase.auth().currentUser.uid;

        for(let image in itemData.imageDoc)
        {
            let imageData = await loginFirebase.getImageData(itemData.imageDoc[image]);
            $("#productImages").append(`<a class="carousel-item"><img src="${imageData.url}"></a>`);
        }

        $('.carousel.carousel-slider').carousel({
            fullWidth: true,
            indicators: true
        });

        if(userUid == itemData.userId)
        {
            $("button[href='#makeOfferModal']").attr("disabled", "disabled");
            $("button[href='#buyProductModal']").attr("disabled", "disabled");
            $("button[href='#rateProductModal']").attr("disabled", "disabled");
            $("#addWatchList").attr("disabled", "disabled");
        }
        else
        {
            $("button[href='#makeOfferModal']").removeAttr("disabled");
            $("button[href='#buyProductModal']").removeAttr("disabled");
            $("button[href='#rateProductModal']").removeAttr("disabled");
            $("#addWatchList").removeAttr("disabled");
        }
               
        if (itemData.bid) {
            $("button[href='#makeOfferModal']").removeClass("hide");
            $("button[href='#buyProductModal']").addClass("hide");
        }
        else
        {
            $("button[href='#makeOfferModal']").addClass("hide");
            $("button[href='#buyProductModal']").removeClass("hide");
        }
        
        $("#productViewId").val(itemData.id);

        $("#productName").text(itemData.itemName);
        $("#dateTime").text(mainTask.getTimeAgo(firebase.firestore.Timestamp.fromDate(new Date()), itemData.timeStamp));
        
   
        $("#productPrice").html("<span>&#8369;</span>" + itemData.price);
        $("#sellerDescription").text(itemData.description);
       
        $("#sellerDp").attr("src", !!userData.imageUrl.upload ? userData.imageUrl.upload : userData.imageUrl.email);
        $("#sellerName").text(userData.givenName + " " + userData.familyName);
        $(".sellerLocation").text(userData.address);

        
        loginFirebase.realTimeComment(itemData.userId);
                            //id of commentor  //id of seller
        $("#usersCommentId").val(userUid + "," + itemData.userId);
       
        let offers = await loginFirebase.getItemOffer(itemData.id);

        productOffers = [];
        let offerElem = "";
        for(let offer in offers)
        {   
            let userImg = await loginFirebase.getUserData(offers[offer].userId);
            
            if(offer == 0){
                $("#txtHighestOffer").text(offers[offer].amount);
            }

            offerElem += `<li> 
                            <div class="chip">
                                <img src="${!!userImg.imageUrl.upload ? userImg.imageUrl.upload : userImg.imageUrl.email}">
                            </div> 
                            ${offers[offer].amount}

                            ${offer == "0" ? `<span class="badge"><i class="fa fa-star"></i></span>` : ""}
                        </li>`;
            
            if(offers[offer].userId == firebase.auth().currentUser.uid)
            {
                if(itemData.bid)
                {
                    $("#cancelOffer").val(offers[offer].id);
                    $("button[href='#makeOfferModal']").text("VIEW YOUR OFFER");
                }
                else
                {
                    $("#cancelBuy").val(offers[offer].id);
                    $("button[href='#buyProductModal']").text("CANCEL BUYING REQUEST");
                    $("#buyProductModalForm div p").text("Are you sure you want to cancel your buying request?");
                }
                
            }else{
                if(itemData.bid)
                {
                    $("button[href='#makeOfferModal']").text("MAKE AN OFFER");
                }
                else
                {
                    $("button[href='#buyProductModal']").text("BUY THIS PRODUCT");
                    $("#buyProductModalForm div p").text("Are you sure you want to buy this product?");
                }
            }

            productOffers.push({userId: offers[offer].userId, amount: offers[offer].amount});
        }

        if(offers.length < 1)
        {
            if(itemData.bid)
            {
                $("button[href='#makeOfferModal']").text("MAKE AN OFFER");
            }
            else
            {
                $("button[href='#buyProductModal']").text("BUY THIS PRODUCT");
                $("#buyProductModalForm div p").text("Are you sure you want to buy this product?");
            }
        }

        if(offers.length < 1)
        {
            $("#txtHighestOffer").text("0 offers");
        }

        $("#productsOffers").html(offerElem);
    },


    addComment: $("#commentForm").submit(async function()
    {
        event.preventDefault();
        let usersId = $("#usersCommentId").val().split(",");
        let commentData = {
            message: $("#inpCommentUser").val(),
            userId: usersId[0],
            beingComment: usersId[1]
        }

        if(await loginFirebase.addComment(commentData))
        {
            console.log("success in commenting");
        }
    }),

    async uploadImage(image)
    {
        let imageData = await loginFirebase.uploadDropImg(image);
        console.log(imageData);
        let success = await loginFirebase.imageAdd(imageData);
        console.log(success);
        return imageData.doc
    },


    userRating: $(".star").click(function()
    {
        let rate = $(this).attr("data");

        $("#star-rating").attr("val", rate);
        $(".star").removeClass("green-text");
        $(".star").addClass("grey-text");
        
        for (let star = 0; star <= Number(rate); star++) {
            $(".star[data="+ star +"]").removeClass("grey-text");
            $(".star[data="+ star +"]").addClass("green-text");
        }
    }),


    userAddRating: $("#rateForm").submit(async function(event)
    {
        event.preventDefault();
        let rate = Number($("#star-rating").attr("val")),
        trust = $("#rateTrust").val(),
        userId = $("#usersCommentId").val().split(",");

        if(await loginFirebase.addUserRate(rate, trust == "on" ? true: false, userId[1]))
        {
            $("#rateProductModal").modal("close");
            alert("Your rate is added!");
        }
    }),

    productSearch: $("#productSearch").submit(async function(event)
    {   
        event.preventDefault();

        $("#searchedProducts").html(preload1);
        $("#searchTxt").text($("#inpSearchProduct").val());

        let display = await subTask.displayProduct(await loginFirebase.getSearchProduct($("#inpSearchProduct").val()));

 
        $("#searchTxt").parent().removeClass("hide");
        $("#searchedProducts").removeClass("hide");
        $("#searchedProducts").html(display);
    }),


    userMakeOffer: $("#makeOfferModalForm").submit(async function()
    {
        event.preventDefault();
        let minOffer = $("#productPrice").text(),
        userOffer = Number($("#userOffer").val()),
        itemId = $("#productViewId").val();

        if(!!!$("#cancelOffer").val())
        {
            minOffer = Number(minOffer.match(/\d+(\.\d+)?/)[0]);
            if(userOffer >= minOffer)
            {
                if(await loginFirebase.makeOffer(userOffer, true, itemId))
                {
                    if(await loginFirebase.updateOfferInItem(itemId, "add"))
                    {
                        $("#makeOfferModal").modal("close");
                        $("#viewProduct").modal("close");
                        alert("Your offer has been made!");
                    }
                }
            }
            else
            {
                alert("Offer must be greater than minimum offer " + minOffer + " set by the seller");
            }
        }
        else
        {
            if(await loginFirebase.cancelOffer($("#cancelOffer").val()))
            {
                if(await loginFirebase.updateOfferInItem(itemId, "minus"))
                {
                    $("#makeOfferModal").modal("close");
                    $("#viewProduct").modal("close");
                    alert("Your offer has been remove!");
                }
            }
        }
   
        
    }),

    buyProduct: $("#buyProductModalForm").submit(async function() {
        event.preventDefault();
        let minOffer = $("#productPrice").text(),
        itemId = $("#productViewId").val();

        if(!!!$("#cancelBuy").val())
        {
            minOffer = Number(minOffer.match(/\d+(\.\d+)?/)[0]);

            if(await loginFirebase.makeOffer(minOffer, false, itemId))
            {
                if(await loginFirebase.updateOfferInItem(itemId, "add"))
                {
                    $("#buyProductModal").modal("close");
                    alert("Your offer has been made!");
                    $("#viewProduct").modal("close");
                }
            }
        }
        else
        {
            if(await loginFirebase.cancelOffer($("#cancelBuy").val()))
            {
                if(await loginFirebase.updateOfferInItem(itemId, "minus"))
                {
                    $("#buyProductModal").modal("close");
                    $("#viewProduct").modal("close");
                    alert("Your offer has been remove!");
                }
            }
        }
   
    }),

    async myDealsClick()
    {
        let chatsByUserOffer = await loginFirebase.getUserOfferOdeal();
        let htmlMyDeals = "";
 
        for(let chatOffer in chatsByUserOffer)
        {
            let sellerItemInfo = await loginFirebase.getItemInfo(chatsByUserOffer[chatOffer].itemId);
            console.log(sellerItemInfo);
            chatsByUserOffer[chatOffer].itemName = sellerItemInfo.itemName;
            chatsByUserOffer[chatOffer].itemImage = await loginFirebase.getImageData(sellerItemInfo.imageDoc[0]);

            htmlMyDeals += `<li class="collection-item avatar">
                                <img src="${chatsByUserOffer[chatOffer].itemImage.url}" alt="" class="circle">
                                <span class="title font-3">${chatsByUserOffer[chatOffer].itemName}</span>
                                <p class="font-normal ${chatsByUserOffer[chatOffer].bid ? "blue-text": "green-text"}">${chatsByUserOffer[chatOffer].bid ? "BID": "SALE"}</p>
                                <div href="" class="secondary-content">${chatsByUserOffer[chatOffer].ondeal ? "DEALING": "PENDING"} </div>
                            </li>`
        }
        $("#myDealsCol").html(htmlMyDeals);
    },

    addWatchList: $("#addWatchList").click(async function()
    {
        let itemId = $("#productViewId").val();
        let userId = firebase.auth().currentUser.uid;
        if(await loginFirebase.addWatchList(itemId, userId))
        {
            M.toast({html: 'New item added to watch list'});
        }
    }),

    async myWatchList()
    {
        let myWatchList = await loginFirebase.getMyWatchList(firebase.auth().currentUser.uid);
        let htmlWatchList = "";
 
        for(let watch in myWatchList)
        {
            let sellerItemInfo = await loginFirebase.getItemInfo(myWatchList[watch].itemId);
            myWatchList[watch].itemName = sellerItemInfo.itemName;
            myWatchList[watch].itemImage = await loginFirebase.getImageData(sellerItemInfo.imageDoc[0]);


            
            let status = `ON BIDING`;
            if(!sellerItemInfo.bid)
            {
                status = `ON SALE`;
            }
            else if(sellerItemInfo.sold)
            {
                status = `SOLD <i class="fa fa-check"></i>`;
            }

            htmlWatchList += `<li class="collection-item avatar" id="watch${myWatchList[watch].id}">
                                <img src="${myWatchList[watch].itemImage.url}" alt="" class="circle">
                                <span class="title font-3">${myWatchList[watch].itemName}</span>
                                <p class="font-normal ${sellerItemInfo.bid ? "blue-text": "green-text"}">${sellerItemInfo.bid ? "BID": "SALE"}</p>
                                <div href="" class="secondary-content">
                                <span class="${sellerItemInfo.bid ? "blue-text": "green-text"}">
                                    ${status} 
                                    <span><i class="fa fa-times red-text ml-1 pointer" onclick="mainTask.removeWatchList('${myWatchList[watch].id}')"></i></span>
                                </span>
                                </div>
                            </li>`;
        }
        $("#myWatchListCol").html(htmlWatchList);
    },

    async removeWatchList(watchId)
    {
        if(await loginFirebase.removeWatchList(watchId))
        {
            $("#watch"+ watchId).remove();
        }
    },

    getTimeAgo(date, dateNow)
    {
        let ago = date.seconds - dateNow.seconds;
   
        let displayTime = "";
        if(ago < 60)
        {
            //seconds
            displayTime = ago + " seconds ago";
        }
        else if(ago < 3600)
        {
            //min
            displayTime = Math.round((ago/60)) + " minutes ago";
        }
        else if(ago < 86400)
        {
            //hours
            displayTime = Math.round((ago/3600)) + " hours ago";
        }
        else if(ago < 604800)
        {
            // day
            displayTime = Math.round((ago/86400)) + " days ago";
        }
        else
        {
            //week
            displayTime = Math.round((ago/604800)) + " weeks ago";            
        }

        return displayTime;
    },

    async modalTransaction()
    {
        let transactions = await loginFirebase.getTransactionHistory(firebase.auth().currentUser.uid);
        let htmltransac = "";
        console.log(transactions);
        for(let tran in transactions)
        {
            htmltransac += `<li class="collection-item avatar">
                            <img src="${transactions[tran].itemImage}" alt="" class="circle">
                            <span class="title font-3">${transactions[tran].itemName}</span>
                            <p class="font-normal">
                            
                            ${transactions[tran].sell ? `Sold in the price of <span class="blue-text">${transactions[tran].amount}</span> pesos By <span class="blue-text">Jayson</span>` : `Bought in the price of <span class="blue-text">600</span> pesos from <span class="blue-text">${transactions[tran].transactorName}</span>`}
                            

                            

                            </p>
                        </li>`;
        }

        $("#myTransactionCol").html(htmltransac);
    }
}

subTask = {
    notLogin() {
        $(".not-login").removeClass("hide");
        $(".logined").addClass("hide");
    },

    logined() {
        $(".not-login").addClass("hide");
        $(".logined").removeClass("hide");
    },

    defaultAddProdoct()
    {
        imagesDoc = ["","",""];
        deleteImages = [];
        console.log("add product modal is reset");
        $("#editItemId").val("");
    
        $("#bid_sell").removeAttr("disabled");
        $("#bid_sell")[0].checked = false;
        $("#itemName").val("");
        $("#price").val("");
        $("#fileInput").val("");

        while ($("#tags")[0].M_Chips.chipsData.length > 0) {
            $("#tags").chips('deleteChip', ($("#tags")[0].M_Chips.chipsData.length - 1));
            console.log($("#tags")[0].M_Chips.chipsData);
        }

        $("#description").val("");

        $("#itemImage1").addClass("hide");
        $("#itemImage2").addClass("hide");
        $("#itemImage3").addClass("hide");
        $("#file_uploadBox").removeClass("hide");
        $("#addproductForm div button").text("Add Product");

    },


    async displayProduct(products)
    {   
        console.log(products);
        let itamsDisplay = "";
        if(products.length > 0)
        {
            for (let product = 0; product < products.length; product++) {
                let imageData = await loginFirebase.getImageData(products[product].imageDoc[0]);
                itamsDisplay += `
                    <div class="col s12 m6 l3">
                        <a href="#viewProduct" onclick="mainTask.viewProduct('${products[product].id}')" class="modal-trigger">
                            <div class="card medium hoverable">
                                <div class="card-image">
                                    <img src="${imageData.url}" class="adj-img">
                                </div>
                                <div class="card-action">
                                    <p class="card-title black-text font-bolder font-3 ellipsis1">${products[product].itemName}</p>
                                    <div class="row">
                                        <div class="col s7 font-3 blue-text"><i class="fas fa-tags"></i>
                                        ${products[product].price} php
                                        </div>
                                        <div class="col s5 font-2 ${products[product].bid ? "offers": "sale"}">
                                        ${products[product].bid ? products[product].offer + " OFFER/S": "SALE"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            }
        }
        else
        {
            itamsDisplay = "0 result";
        }
        
        return itamsDisplay;
    }
}