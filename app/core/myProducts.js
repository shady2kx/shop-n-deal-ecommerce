
    if(typeof getUserProducts != "undefined")
    {
        getUserProducts();
    }
    

    $("#file_uploadBox").off();
    $("#fileInput").off();
    $("#addproductForm").off();
    $("#removeImage1").off();
    $("#removeImage2").off();
    $("#removeImage3").off();
 
   
    

    $("#file_uploadBox").click(function(){
        alert("Dsadas");
        $("#fileInput").click();
    })

    $("#fileInput").change(function(){
        if(this.value != null)
        {   
            let notImage = 0;
            console.log(this.files);
            for (let file = 0; file < this.files.length; file++) {
                
                if(checkEmpty() != 0)
                {
                    let extension = this.files[file].name.replace(/.+\./, "");

                    if(extension.match(/(jpg|jpeg|png|PNG|JPEG)/))
                    {
                        let pos = checkEmpty();
                  
                        imagesDoc[(pos - 1)] = this.files[file];
                        $("#itemImage" + pos).removeClass("hide");
                        $("#itemImage" + pos + " img").attr("src", window.URL.createObjectURL(this.files[file]));
        
                        if(checkEmpty() == 0)
                        {
                            $("#file_uploadBox").addClass("hide");
                        }
                    }
                    else
                    {
                        this.value = null;
                        alert("File is not a valid image!");
                    }
                }
                else
                {
                    alert("You can only upload 3 images");
                    break;
                }
                
            }
          
            if(!!notImage)
            {
                alert(notImage + " files is not a valid image!");
            }
        }
    })

    function checkEmpty(){
        let num = 0;

        console.log(imagesDoc);
        for (let image in imagesDoc) {
            if(!!!imagesDoc[image])
            {
                return (Number(image) + 1);
            }
        }
        return num
    }

    function checkThereImage(){
        for (let image in imagesDoc) {
            if(!!imagesDoc[image])
            {
                return true;
            }
        }
        return false
    }

    $("#removeImage1").click(function(){
        removeImage(1);
    })
    $("#removeImage2").click(function(){
        removeImage(2);
    })
    $("#removeImage3").click(function(){
        removeImage(3);
    })


    function removeImage(num){
       
        $("#itemImage" + num).addClass("hide");

        $("#file_uploadBox").removeClass("hide");
   
        if(typeof(imagesDoc[num - 1].name) == "undefined"){
            deleteImages.push(imagesDoc[num - 1]);
        }

        imagesDoc[num - 1] = "";
    }

    $("#addproductForm").submit(async function(event){
        event.preventDefault();

        $("#addproductForm div button").attr("disabled", "disabled");
        $("#addproductForm div button:first-child").html(`SUBMITTING ${preload3}`);

        if(checkThereImage() && $("#tags")[0].M_Chips.chipsData.length > 0)
        {
            let imageDoc = [];
            for(let image in imagesDoc)
            {
                if(!!imagesDoc[image])
                {
                    if(typeof(imagesDoc[image].name) != "undefined"){
                        imageDoc.push(await mainTask.uploadImage(imagesDoc[image]));
                    }
                    else
                    {
                        imageDoc.push(imagesDoc[image]);
                    }
                }
            }

            console.log(imageDoc);

            let success;
         
            if(!!$("#editItemId").val())
            {
                 success = await loginFirebase.editProduct({
                    id: $("#editItemId").val(),
                    bid: !$("#bid_sell")[0].checked,
                    imageDoc: imageDoc,
                    itemName: $("#itemName").val(),
                    description: $("#itemName").val(),
                    price: $("#price").val(), 
                    tags: reformatTags($("#tags")[0].M_Chips.chipsData)
                });

                console.log(deleteImages);
                if(deleteImages.length > 0)
                {
                    for(let img in deleteImages)
                    {
                        let imageData = await loginFirebase.getImageData(deleteImages[img]);
                        if(await loginFirebase.deleteImage("itemImages/" + imageData.name))
                        {
                            if(await loginFirebase.deleteImageBase(deleteImages[img]))
                            {
                                console.log("Success Delete an Image");
                            }
                        }
                    }
                }

                console.log("update");
            }
            else
            {
                 success = await loginFirebase.addProduct({
                    bid: !$("#bid_sell")[0].checked,
                    imageDoc: imageDoc,
                    itemName: $("#itemName").val(),
                    description: $("#itemName").val(),
                    price: $("#price").val(), 
                    tags: reformatTags($("#tags")[0].M_Chips.chipsData)
                });
    
            }
           
            

            if(success)
            {
                $("#addproduct").modal("close");
            }
        }
        else
        {
            alert("Image and Tags is required");
        }

        $("#addproductForm div button").removeAttr("disabled", "disabled");
        $("#addproductForm div button:first-child").html(`ADD PRODUCT`);
    })


    


    function reformatTags(elTags){
        let tags = [];
        for(let tag in elTags)
        {
            tags.push(elTags[tag].tag);
        }
        return tags         
    }


    async function displayMyProduct(products)
    {
        $("#MyProducts").removeClass("hide");
        $("#noProduct").addClass("hide");
        let imageData = await loginFirebase.getImageData(products.imageDoc[0]),
        strTags = "",
        strImageDoc = "";
        for(let tag in products.tags){ strTags += "&&" + products.tags[tag]; }

        for(let image in products.imageDoc){ strImageDoc += "&&" + products.imageDoc[image]; }

        let offerElem = "";
        let highestOffer = 0;
        if (products.offer > 0) {
            let offers = await loginFirebase.getItemOffer(products.id);

            for(let offer in offers)
            {   
                let userImg = await loginFirebase.getUserData(offers[offer].userId);
                
                if(offer == 0){
                    highestOffer = offers[offer].amount;
                }

                offerElem += `<li> 
                                <a>
                                    <div class="chip" style="padding: 0;width: 24px;">
                                        <img style="height: 40px;width: 40px;" src="${!!userImg.imageUrl.upload ? userImg.imageUrl.upload : userImg.imageUrl.email}">
                                    </div>
                                    &#8369;${offers[offer].amount}
                                    ${offer == "0" ? `<i class="fa fa-star" style="color: gold !important"></i>` : ""}
                                    <button${products.ondeal ? " disabled": ""} class="btnDeal${products.id} waves-effect waves-light btn right" onclick="myProductCore.approveDealOffer('${offers[offer].id}', '${products.id}')" style="color:white !important;width: 70px;">Deal</button>
                                </a>
                            </li>`;
            }
        }

        
   
        $("#MyProductsItems").append(`
        <li class="collection-item avatar" id="${products.id}">
        <img src="${!!imageData ? imageData.url : "url"}" alt="YourProductImage" class="circle">
        <span class="title font-3">${products.itemName}</span>
        <p class="font-normal ${products.bid ? "blue-text" : "green-text"}">${products.bid ? products.offer + " OFFER/S": "SELL"}</p>
        <div class="secondary-content">

        ${products.offer > 0 ? `
            <ul id="productsOffers${products.id}" class="dropdown-content">
                ${offerElem}
            </ul>
            <a class="btn dropdown-trigger" href="#!" data-target="productsOffers${products.id}">&#8369; ${highestOffer} <i class="fas fa-caret-down"></i></a>
        `: ""}
        
        
        <a href="#addproduct" onclick="myProductCore.editProductItemClick('${products.id}', ${products.bid}, '${products.itemName}', ${products.price}, '${strTags}', '${products.description}', '${strImageDoc}')" class="modal-trigger"><i class="far fa-edit blue-text"></i></a>
        <a href="#deleteUserProduct" onclick="myProductCore.deleteClick('${products.itemName}', '${products.id}', '${strImageDoc}')" class="modal-trigger"><i class="far fa-trash-alt ml-3 red-text"></i></a></div>
        </li>`);

        
        $('.dropdown-trigger').dropdown({container: "body"});
    }

    async function getUserProductsSize()
    {
            let productsSize = await loginFirebase.getUserProductsSize();
          
            if (productsSize > 0) {
                $("#MyProducts").removeClass("hide");
                $("#noProduct").addClass("hide");
            } else {
                $("#MyProducts").addClass("hide");
                $("#noProduct").removeClass("hide");
            }
    }

    getUserProductsSize();

    getUserProducts = db.collection("items").where("userId", "==", firebase.auth().currentUser.uid).orderBy("timeStamp", "desc")
    .onSnapshot(function (items) {
        
        items.docChanges().forEach(async function (item) {
            console.log(item);
            if (item.type == "added")
            {
                 let userItem = item.doc.data();
                 userItem.id = item.doc.id;
                 displayMyProduct(userItem);
            }
            else if (item.type == "removed") {
                $("#" + item.doc.id).remove();
            }
            else if (item.type == "modified") {
                let itemData = item.doc.data();
                let imageData = await loginFirebase.getImageData(itemData.imageDoc[0]),
                strTags = "",
                strImageDoc = "";

                for(let tag in itemData.tags){ strTags += "&&" + itemData.tags[tag]; }
        
                for(let image in itemData.imageDoc){ strImageDoc += "&&" + itemData.imageDoc[image]; }

                $("#" + item.doc.id + " a[href='#addproduct']").attr("onclick", `myProductCore.editProductItemClick('${item.doc.id}', ${itemData.bid}, '${itemData.itemName}', ${itemData.price}, '${strTags}', '${itemData.description}', '${strImageDoc}')`);

                $("#" + item.doc.id + " a[href='#deleteUserProduct']").attr("onclick", `myProductCore.deleteClick('${itemData.itemName}', '${item.doc.id}', '${strImageDoc}')`);

                $("#" + item.doc.id + " img").attr("src", imageData.url);
                $("#" + item.doc.id + " span").text(itemData.itemName);

                
                if(itemData.ondeal)
                {
                    console.log("add disabled");
                    $(".btnDeal" + item.doc.id).attr("disabled", "disabled");
                }
                else
                {
                    console.log("remove disabled");
                    $(".btnDeal" + item.doc.id).removeAttr("disabled");
                }
                
            }
        });

        
    })



var getUserProducts;
var imagesDoc = ["","",""],
deleteImages = [];

var myProductCore = {
    deleteClick(itemName, id, strImages)
    {
        $("#deleteUserProduct div span").text(`Are you sure you want to remove ${itemName}?`);
        $("#deleteUserProduct div button").attr("onclick", `myProductCore.deleteProduct("${id}", "${strImages}")`);
    },

    async deleteProduct(id, strImages)
    {
        let imageDoc = strImages.split("&&");
        imageDoc.splice(0,1);

        for (let image = 0; image < imageDoc.length; image++) {
            let imageData = await loginFirebase.getImageData(imageDoc[image]);
            if(await loginFirebase.deleteImage("itemImages/" + imageData.name))
            {
                if(await loginFirebase.deleteImageBase(imageDoc[image]))
                {
                    console.log("Success Delete an Image");
                }
            }
        }

        if(await loginFirebase.deleteProduct(id))
        {
            alert("success delete!");
            $("#deleteUserProduct").modal("close");
        }
        else
        {
            alert("failed to delete");
        }
    },

    async editProductItemClick(id, bid, itemName, price, tags, description, imageDoc)
    {
        let Newtags = tags.split("&&");
        let NewimageDoc = imageDoc.split("&&");
        Newtags.splice(0,1);
        NewimageDoc.splice(0,1);
 
        subTask.defaultAddProdoct();
    
        $("#editItemId").val(id);

    

        $("#bid_sell").attr("disabled", "disabled");

        if(!bid){
            $("#bid_sell").attr("checked", "checked");
        }
        

        $("#itemName").val(itemName);
        $("#price").val(price);

        for (let tag in Newtags) {
            $("#tags").chips('addChip', { tag: Newtags[tag]});
        }

        $("#description").val(description);

        if(NewimageDoc.length >= 3)
        {
            $("#file_uploadBox").addClass("hide");
        }



        for(let image in NewimageDoc)
        {
            imagesDoc[image] = NewimageDoc[image];
            $("#itemImage" + (Number(image) + 1)).removeClass("hide");
            let imageData = await loginFirebase.getImageData(NewimageDoc[image]);
            $("#itemImage" + (Number(image) + 1) + " img").attr("src", imageData.url);
        }

        $("#addproductForm div button").text("Edit Product");
    },

    async approveDealOffer(bidId, itemId)
    {
        if(await loginFirebase.ondealItem(itemId, true))
        {
            if(await loginFirebase.ondealBid(bidId, true))
            {
                $('.tabs').tabs('select', 'btnMyMessages');
                hashChange("myMessages");
            }
        }
    }
}