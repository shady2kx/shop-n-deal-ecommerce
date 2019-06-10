$(document).ready(function()
{
    console.log(loginFirebase.isUserLogin());
    if(!loginFirebase.isUserLogin())
    {
        $(".not-login").removeClass("hide");
    }
    else
    {

        $(".not-login").addClass("hide");
    }

   

    async function getFaeturedProducts(){
        $("#featuredProducts").html(preload1);
        let display = await subTask.displayProduct(await loginFirebase.getFeaturedProducts());
        $("#featuredProducts").html(display);
    }   

    async function getNewProducts(){
        $("#newProducts").html(preload1);
        let display = await subTask.displayProduct(await loginFirebase.getNewProducts());
        $("#newProducts").html(display);
    }

    getFaeturedProducts();
    getNewProducts();

})

