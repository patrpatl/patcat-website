document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.x-scroll').forEach(function (el) {
        el.addEventListener('wheel', function (e) {
            // Only capture scroll if content overflows horizontally
            if (el.scrollWidth > el.clientWidth && e.deltaY !== 0) {
                e.preventDefault();
                el.scrollLeft += e.deltaY * 3;
            }
        }, { passive: false });
    });
});