// When DOM is ready, apply the anoymous function
$('ul.navbar-nav').ready(function() {
    // Remove the 'active' class from a tag containing 'active' class 
    $('a.active').removeClass('active');

    // Add the 'active' class to the a tag is clicked
    $('a[href="' + location.pathname + '"]').addClass('active'); 
});