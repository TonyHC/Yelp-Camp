const container = $('#infiniteScrollCampgrounds');

let campgroundStartIndex = 0;
let campgroundEndIndex = 10;
const campgroundSize = 10;

loadCampgroundCards();

$(window).on('scroll', () => {
    /*
        window.scrollY: Indicates how much the document has been scrolled from the top
        window.innerHeight: Indicates the visible part of the window
        window.scrollHeight: Indicates the height of the entire document
    */
    if (window.scrollY + window.innerHeight + 20 >= document.documentElement.scrollHeight && campgroundStartIndex < campgrounds.features.length) {
        loadCampgroundCards();
    }
});

function loadCampgroundCards() {
    createCampgroundCards(campgroundStartIndex, campgroundEndIndex);
}

function createCampgroundCards(start, end) {
    const campgroundsSlice = campgrounds.features.slice(start, end);
    
    if (campgroundsSlice) {
        for (let campground of campgroundsSlice) {
            container.append(
                `<div class="card mt-3">
                    <div class="row">
                        <div class="col-md-4">
                            <img class="img-fluid" src="${campground.images[0].url}" alt="campground-image">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h5 class="card-title">${campground.title}</h5>
                                <p class="card-text">${campground.description}</p>
                                <p class="card-text">
                                    <small class="text-muted">${campground.location}</small>
                                </p>
                                <a class="btn btn-primary" href="/campgrounds/${campground._id}">View ${campground.title}</a>
                            </div>
                        </div>
                    </div>
                </div>`);
        }

        campgroundStartIndex += campgroundSize;
        campgroundEndIndex += campgroundSize;
    } 
}