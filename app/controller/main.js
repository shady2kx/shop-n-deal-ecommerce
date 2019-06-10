let href;

function change_page(page)
{
    href = page;
    $.ajax({
        url: "../app/views/" + page + ".html",
        dataType: "html",
        error: function()
        {
            change_page("home");
        },
        success: function(page)
        {
            $("#mainContent").html(page);
        }
    })
}

 function firstLoad() {
    href = checkUrl();
    href.match(/(localhost|https|192\.168)/) ? change_page("home") : change_page(href);
 };


 function checkUrl()
{
    return window.location.href.replace(/.+#/, "")
}

function hashChange(new_href)
{
    console.log(new_href);
    new_href != href ? change_page(new_href) : false;
}

 window.onhashchange = e => {
     var new_href = checkUrl();
     hashChange(new_href);
 };

 firstLoad();