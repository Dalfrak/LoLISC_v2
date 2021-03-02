$(function () {

    $('.category.title').hover(function () { // TODO: deprecated
        $(this).toggleClass('hover');
    });

    $('.category.title').click(function () { // TODO: deprecated
        $(this).next('.collapsible').css('display', ($(this).next().css('display') == 'none') ? 'table' : 'none');
        $(this).toggleClass('hidden');
    });

    let showTooltip = function (evt) {
        $('div.tooltip').remove();
        $elem = $('<div class="tooltip">' + $(this).children().last().html() + '</div>').appendTo('body');
        var tooltipX = event.pageX; // TODO: deprecated
        var tooltipY = event.pageY; // TODO: deprecated
        height = $('div.tooltip').height();
        bottomScreenBorder = $('body').outerHeight();
        tooltipY = (tooltipY + height >= bottomScreenBorder) ? tooltipY - height : tooltipY;
        $('div.tooltip').css({ top: tooltipY, left: tooltipX });
    };

    let hideTooltip = function () {
        $('div.tooltip').remove();
    };

    $('.item_img').bind({ // TODO: deprecated
        mouseenter: showTooltip,
        mouseleave: hideTooltip
    });

    $('th.sortable').click(function (evt) { // TODO: deprecated
        let $tableElem, $rows, switching, i, x, y, shouldSwitch;
        let order = (a, b) => ($(this).hasClass('ascendant')) ? a < b : a > b;
        $tableElem = $(this).parent().parent().parent();
        switching = true;
        while (switching) {
            switching = false;
            $rows = ($($tableElem[0].firstChild).children());
            for (i = 1; i < ($rows.length - 1); i++) {
                shouldSwitch = false;
                x = parseFloat($($rows[i]).children('.' + $(this).attr('class').split(' ')[1]).text());
                y = parseFloat($($rows[i + 1]).children('.' + $(this).attr('class').split(' ')[1]).text());
                if (order(x, y)) {
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                $($rows[i + 1]).insertBefore($($rows[i]));
                switching = true;
            }
        }
        $(this).parent().children().toggleClass('ascendant');
    });
});