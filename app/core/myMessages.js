// !! ADD MESSAGE ACTIVE TIME IN BID DOCS TO ORDER IT

var messagingReal;



var myMessagesCore = {
    async getChats()
    {
        let chatsByUserOffer = await loginFirebase.getUserOfferOdeal();
        let userItems = await loginFirebase.getUserItemsNotSold();
        let chatsByUserDeal = [];

        console.log(userItems);
        for(let item in userItems)
        {
            let chatDeal = await loginFirebase.getUserDeals(userItems[item].id);
            if(!!chatDeal)
            {
                chatDeal.sellerInp = true;
                chatDeal.itemName = userItems[item].itemName;
                chatDeal.sellerId = userItems[item].userId;
                chatsByUserDeal.push(chatDeal);
            }
        }

        console.log(chatsByUserDeal);

        for(let chatOffer in chatsByUserOffer)
        {
            let sellerItemInfo = await loginFirebase.getItemInfo(chatsByUserOffer[chatOffer].itemId);
            let sellerInfo = await loginFirebase.getUserInfo(sellerItemInfo.userId);
            chatsByUserOffer[chatOffer].image = !!sellerInfo.imageUrl.upload ? sellerInfo.imageUrl.upload : sellerInfo.imageUrl.email;
            chatsByUserOffer[chatOffer].chatName = sellerInfo.givenName + " " + sellerInfo.familyName;
            chatsByUserOffer[chatOffer].itemName = sellerItemInfo.itemName;
            chatsByUserOffer[chatOffer].sellerId = sellerItemInfo.userId;
            chatsByUserOffer[chatOffer].sellerInp = false;
        }

        for(let chatDeal in chatsByUserDeal)
        {
            let sellerInfo = await loginFirebase.getUserInfo(chatsByUserDeal[chatDeal].userId);
            chatsByUserDeal[chatDeal].image = !!sellerInfo.imageUrl.upload ? sellerInfo.imageUrl.upload : sellerInfo.imageUrl.email;
            chatsByUserDeal[chatDeal].chatName = sellerInfo.givenName + " " + sellerInfo.familyName;
        }

        console.log(chatsByUserOffer);
        return chatsByUserOffer.concat(chatsByUserDeal);
    },
    
    displayChatHeads(chatHeads)
    {
        let chatsEl = "";
        for(let chat in chatHeads)
        {
            if(chat == "0")
            {
                myMessagesCore.chatHeadClick(chatHeads[chat].id, chatHeads[chat].image, chatHeads[chat].sellerInp, chatHeads[chat].chatName, chatHeads[chat].itemName, chatHeads[chat].itemId, chatHeads[chat].userId, chatHeads[chat].sellerId);
            }

            chatsEl += `<li class="p-h m-select tooltipped" id="head${chatHeads[chat].id}" data-position="right" data-tooltip="${chatHeads[chat].itemName}" onclick="myMessagesCore.chatHeadClick('${chatHeads[chat].id}', '${chatHeads[chat].image}', '${chatHeads[chat].sellerInp}', '${chatHeads[chat].chatName}', '${chatHeads[chat].itemName}', '${chatHeads[chat].itemId}', '${chatHeads[chat].userId}', '${chatHeads[chat].sellerId}')">
                <div class="chip center white-text ${chatHeads[chat].sellerInp ? "orange darken-3" : "blue"}">
                    ${chatHeads[chat].sellerInp ? "SELLING" : "BUYING"}
                </div>
                            <img src="${chatHeads[chat].image}" class="circle" style="height:40px;">
                        </li>`;
        }
        $("#myChatHeads").html(chatsEl);

        $('.tooltipped').tooltip();
    },

    async chatHeadClick(bidId, image, sellerInp, chatName, itemName, itemId, userId, sellerId)
    {
        let bidData = await loginFirebase.getBidData(bidId);

        if(bidData.sucTransac[!sellerInp ? "seller": "buyer"] == true)
        {
            $("#someOneTransacConfirm").html(`Just confirm that this transaction is complete click <button class="btn br-max blue modal-trigger" href="#successTransactionModal">here</button> to confirm too.`);
        }   

        $("#inpMessage").removeAttr("disabled");
        

        $("#bidId").text(bidId);
        $("#chatUserId").text(userId);
        $("#chatSellerId").text(sellerId);
        
        $("#sellerInp").text(String(sellerInp));

        $("#confirmTransacItemId").text(itemId);
        
        $("#chatUserName").text(chatName);
        $("#chatItemName").text(itemName);


        realTimeAgoChat = [];
        realTimeChatData = [];

        $("#myMessagesText").html("");
        !!messagingReal ? messagingReal() : false;
        messagingReal = db.collection("bids").doc(bidId).collection("messages").orderBy("timeStamp")
        .onSnapshot(function (messages) {
            messages.docChanges().forEach(function (message) {
                if (message.type == "added")
                {
                    $("#myMessagesText").removeClass("center");
                    messageData = message.doc.data()
                    $("#myMessagesText").append(`<div class="${messageData.userId == firebase.auth().currentUser.uid ? "container1 darker" : "container1"}">
                    ${messageData.userId == firebase.auth().currentUser.uid ? "" : `<img src="${image}" style="height:50px;" class="avatar" alt="Avatar">`}
                            <p>${messageData.message}</p>
                            <span class="time-right" id="msg${message.doc.id}">${mainTask.getTimeAgo(firebase.firestore.Timestamp.fromDate(new Date()), messageData.timeStamp)}</span>
                        </div>`);
                    
                    realTimeChatData.push({
                        msid: message.doc.id,
                        timeago: messageData.timeStamp
                    })
                    let realreal = realTimeAgoChat.length;
                    realTimeAgoChat.push(setInterval(function(){myMessagesCore.realTimeAgoChats(realreal)}, 10000));

                   

                    console.log(realTimeAgoChat);
                }
            });
        })
    },


    realTimeAgoChats(pos)
    {
        let timeagonow = mainTask.getTimeAgo(firebase.firestore.Timestamp.fromDate(new Date()), realTimeChatData[pos].timeago);
        $("#msg"+ realTimeChatData[pos].msid).text(timeagonow);
    },



    sendMessage: $("#messageInp").submit(async function(event)
    {
        event.preventDefault();   
        console.log($("#inpMessage").val(), $("#bidId").val(), $("#sellerInp").val());
        if(await loginFirebase.addMessages($("#inpMessage").val(), $("#bidId").text(), $("#sellerInp").text()))
        {
            $("#inpMessage").val("");
        }
        else
        {
            alert("Hndi nasend!");
        }
    }),

    confirmSucTransac: $("#confirmSucTransacForm").submit(async function()
    {
        event.preventDefault();
        let bidId = $("#bidId").text();
        let sellerInp = $("#sellerInp").text();
        let itemId = $("#confirmTransacItemId").text();

      

        if(await loginFirebase.updateSucTransac(bidId, sellerInp))
        {
            console.log("Request of success transaction has been made");
            let bidData = await loginFirebase.getBidData(bidId);
            if(bidData.sucTransac.buyer && bidData.sucTransac.seller)
            {
                if(await loginFirebase.updateSoldItem(itemId))
                {
                    if(await loginFirebase.updateBidComplete(bidId))
                    {
                        let userId =  $("#chatUserId").text();
                        let sellerId = $("#chatSellerId").text();
                        let userName = $("#chatUserName").text();
                        let itemData = await loginFirebase.getItemInfo(itemId);

                        console.log("sellerId" + sellerId);
                    
                        let imageData = await loginFirebase.getImageData(itemData.imageDoc[0]);
                        let timeStamp = firebase.firestore.Timestamp.fromDate(new Date());
                        if(await loginFirebase.addTransacHistory({
                            amount: bidData.amount,
                            sell: sellerInp == "true" ? true:false,
                            timeStamp: timeStamp,
                            transactorId: sellerInp == "true" ? userId: sellerId,
                            transactorName: userName,
                            userId: firebase.auth().currentUser.uid,
                            itemImage: imageData.url,
                            itemName: itemData.itemName
                        }))
                        {
                            if(await loginFirebase.addTransacHistory({
                                amount: bidData.amount,
                                sell: sellerInp != "true" ? true:false,
                                timeStamp: timeStamp,
                                transactorId: firebase.auth().currentUser.uid,
                                transactorName: $(".userFullName")[0].innerText,
                                userId: sellerInp == "true" ? userId: sellerId,
                                itemImage: imageData.url,
                                itemName: itemData.itemName
                            }))
                            {
                                console.log("Item has been sold");
                                console.log("transaction History Has been made");
                                console.log(bidId);
                                $("#head" + bidId).remove();
                                $("#inpMessage").attr("disabled", "disabled");
                                $("#myMessagesText").html("");
                                $("#chatUserName").text("");
                                $("#chatItemName").text("");
                                $("#someOneTransacConfirm").html("");
                                $("#myChatHeads li:first-child").click();
                            }
                        }
                       
                    } 
                }
            }
            $("#successTransactionModal").modal("close");
        }
    })
}

async function goMessages()
{
    myMessagesCore.displayChatHeads(await myMessagesCore.getChats());
}

goMessages();
