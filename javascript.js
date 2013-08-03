// Walking Around Testing by Jason Gmitter
// http://www.ranchstory.co.uk/pokemon/pokemon.htm

// Able to move menus around the screen: remember positions too!
// Chat at bottom for talking to everyone on the map

function init() {
    // Set Map
    document.getElementById("menu").style.display = "none";
    move_map(pos_x, pos_y);
    game_loop();
}

// Screen width: 640 x 480 (20 x 15)
player_id = Math.round(1000 * Math.random()); // enh, normally you'd have a user account with this info
pos_x = 26; // Character X
pos_y = 0; // Character Y
dir = 4; // Facing direction (1 = left, 2 = up, 3 = right, 4 = down)
map_width = 36; // Number of tiles wide
map_height = 29; // Number of tiles high
map_top = 0; // Topmost portion of the map to display
map_left = 0; // Leftmost portion of the map to display

// Screen Settings
screen_width = 20;
screen_height = 15;
screen_last_top = 0;
screen_last_left = 0;
chat_size = 1;
chat_on = 1; // Can resize the chat window

// AJAX
var http = (navigator.appName == "Microsoft Internet Explorer") ? new ActiveXObject("Microsoft.XMLHTTP") : new XMLHttpRequest();
var ajax_busy = 0;

// Boundaries
var map = new Array();
map[0] = "111111111111110011111111110011111111".split('');
map[1] = "111111111111110011111111110011111111".split('');
map[2] = "111111111111110011111111110011111111".split('');
map[3] = "111111111111110011111111110000001111".split('');
map[4] = "111111111111110011111111110000001111".split('');
map[5] = "111111111111110011111111112222221111".split('');
map[6] = "110000000000100001111000000000001111".split('');
map[7] = "110111111111100001111000000000001111".split('');
map[8] = "110111100000100001111000000000001111".split('');
map[9] = "110111100000100001111000000000001111".split('');
map[10] = "110100000000100000000000000000000011".split('');
map[11] = "110100000000100000000000000000000011".split('');
map[12] = "110100111100100011111111111111110011".split('');
map[13] = "110111111111100010000000000000010011".split('');
map[14] = "110100111100100011111000000111110011".split('');
map[15] = "110100111100100011111000000111110011".split('');
map[16] = "110100111100100011111000000111110011".split('');
map[17] = "111110000001100010000000000111110011".split('');
map[18] = "000000000000000000000000000000000000".split('');
map[19] = "000000000000000000000000000000000000".split('');
map[20] = "111111111111110011111111111111110011".split('');
map[21] = "111111111111110011111000000111110011".split('');
map[22] = "111111111111110011111000000111110011".split('');
map[23] = "111111111111110011111000000111110011".split('');
map[24] = "111111111111110010000000000000010011".split('');
map[25] = "111111111111110000000000000000000011".split('');
map[26] = "111111111111110000000000000000000011".split('');
map[27] = "111111111111110000000000000000000011".split('');
map[28] = "111111111111111111111111111111111111".split('');

// Overlay
overlay = new Array();
overlay[0] = "000000000000000000000000000000000000".split('');
overlay[1] = "000000000000000000000000000000000000".split('');
overlay[2] = "000000000000000000000000000000000000".split('');
overlay[3] = "000000000000000000000000000000000000".split('');
overlay[4] = "000000000000000000000000000000000000".split('');
overlay[5] = "000000000000000000000000000000000000".split('');
overlay[6] = "000000000000000000000000000000000000".split('');
overlay[7] = "000000000000000000000000000000000000".split('');
overlay[8] = "000000000000000000000000000000000000".split('');
overlay[9] = "000000000000000000000000000000000000".split('');
overlay[10] = "000000000000000000000000000000000000".split('');
overlay[11] = "000000000000000000000000000000000000".split('');
overlay[12] = "000000000000000000000000000000000000".split('');
overlay[13] = "000000000000000000000000000000000000".split('');
overlay[14] = "000000000000000000000000000000000000".split('');
overlay[15] = "000000000000000000000000000000000000".split('');
overlay[16] = "000000000000000000000000000000000000".split('');
overlay[17] = "000000000000000000000000000000000000".split('');
overlay[18] = "000000000000000000000000000000000000".split('');
overlay[19] = "121212121212120000000000000000000012".split('');
overlay[20] = "000000000000000000000000000000000000".split('');
overlay[21] = "000000000000000000000000000000000000".split('');
overlay[22] = "000000000000000000000000000000000000".split('');
overlay[23] = "000000000000000000000000000000000000".split('');
overlay[24] = "000000000000000000000000000000000000".split('');
overlay[25] = "000000000000000000000000000000000000".split('');
overlay[26] = "000000000000000000000000000000000000".split('');
overlay[27] = "000000000000001212121212121212121200".split('');
overlay[28] = "000000000000000000000000000000000000".split('');

overlay_images = new Array();
overlay_images[0] = "spacer.gif";
overlay_images[1] = "treetopl.gif";
overlay_images[2] = "treetopr.gif";

// Other Characters
npc = new Array();
npc[0] = new Array();
npc[0]['x'] = 8;
npc[0]['y'] = 17;
npc[0]['img'] = "down.gif";

// The main loop, continuously runs
var loop = 0;

function game_loop() {
    if (loop % 2 == 0)
        chat_get();
    else
        pos_sendrec();

    move_map(pos_x, pos_y);

    loop++;
    setTimeout("game_loop();", 1000);
}

// Cannot walk through characters
// Enter while two characters are facing to talk.
// Chat one-on-one when talking to a player.

function getkey(e) {
    var unicode = e.keyCode ? e.keyCode : e.charCode;

    // Remove old position
    erase_char(pos_x - map_left, pos_y - map_top);
    clear_overlay(pos_x - map_left, pos_y - map_top);

    if (npc[0]['x'] >= map_left && npc[0]['x'] < map_left + screen_width && npc[0]['y'] >= map_top && npc[0]['y'] < map_top + screen_height) {
        erase_char(npc[0]['x'] - map_left, npc[0]['y'] - map_top);
    }

    if ( /*unicode == 13 ||*/ unicode == 77 && chat_on == 1) {
        // Call Menu: m or enter
        if (document.getElementById("menu").style.display == "none")
            document.getElementById("menu").style.display = "block";
        else
            document.getElementById("menu").style.display = "none";
    } else if (unicode == 67 && chat_on == 1) {
        // C to change the size of the chat box or to hide it altogether
        if (chat_size == 3)
            chat_size = 0;
        else
            chat_size++;

        // Resize or hide chat box
        if (chat_size == 0)
            document.getElementById("chat").style.display = "none";
        else if (chat_size == 1) {
            // Reshow Chat
            document.getElementById("chat").style.display = "block";
            document.getElementById("chat").style.height = "98px";
            document.getElementById("chat").style.top = "-120px";
            document.getElementById("convobox").style.height = "72px";
        } else if (chat_size == 2) {
            document.getElementById("chat").style.height = "218px";
            document.getElementById("chat").style.top = "-240px";
            document.getElementById("convobox").style.height = "192px";
        } else if (chat_size == 3) {
            document.getElementById("chat").style.height = "458px";
            document.getElementById("chat").style.top = "-480px";
            document.getElementById("convobox").style.height = "432px";
        }

        document.getElementById("convobox").scrollTop = document.getElementById("convobox").scrollHeight;

        // Levels of chat size: hidden, tiny (64px high), full screen
    } else if (unicode == 37) {
        // Left Arrow
        dir = 1;

        if (pos_x > 0 && map[pos_y][pos_x - 1] == 0) {
            pos_x--;
        }
    } else if (unicode == 38) {
        // Up Arrow
        dir = 2;

        if (pos_y > 0 && map[pos_y - 1][pos_x] == 0) {
            pos_y--;
        } else if (map[pos_y + 1][pos_x] == 2) {
            // Jump
            pos_y += 2;
        }
    } else if (unicode == 39) {
        // Right Arrow
        dir = 3;

        if (pos_x < map_width - 1 && map[pos_y][pos_x + 1] == 0) {
            pos_x++;
        } else if (map[pos_y + 1][pos_x] == 2) {
            // Jump
            pos_y += 2;
        }
    } else if (unicode == 40) {
        // Down Arrow
        dir = 4;

        if (pos_y < map_height - 1 && map[pos_y + 1][pos_x] == 0) {
            pos_y++;
        } else if (map[pos_y + 1][pos_x] == 2) {
            // Jump
            pos_y += 2;
        }
    }

    move_map(pos_x, pos_y);
    sleep(10);

    return false;
}

function move_map(x, y) {
    // Sets the top-left tile of the map to show of the map
    map_top = y - Math.floor(screen_height / 2);
    map_left = x - Math.floor(screen_width / 2);

    // "Stick to sides"
    if (map_top < 0)
        map_top = 0;
    else if (map_top > map_height - screen_height)
        map_top = map_height - screen_height;

    if (map_left < 0)
        map_left = 0;
    else if (map_left > map_width - screen_width)
        map_left = map_width - screen_width;

    draw_map(map_left, map_top)
}

// Places the character at position x, y

function show_char(x, y) {
    document.getElementById(x + "_" + y).style.backgroundImage = "url('down.gif')";
    document.getElementById(x + "_" + y).style.backgroundPosition = "0 -32px";
}

// Erases character from x, y

function erase_char(x, y) {
    document.getElementById(x + "_" + y).style.background = "none";
    if (y > 0) document.getElementById(x + "_" + (y - 1)).style.background = "none";
}

// Overlays an image (e.g. a tree top) at x, y

function set_overlay(x, y, image) {
    document.getElementById("over_" + x + "_" + y).src = image;
}

// Clear Overlayed Image

function clear_overlay(x, y) {
    document.getElementById("over_" + x + "_" + y).src = "spacer.gif";
}

function draw_map(left, top) {
    for (y = 0; y < screen_height; y++) {
        for (x = 0; x < screen_width; x++) {
            erase_char(x, y);
        }
    }

    // Redraws the map starting from the top left given
    show_char(pos_x - left, pos_y - top);
    set_overlay(pos_x - left, pos_y - top, overlay_images[overlay[pos_y][pos_x]]);
    document.getElementById("screen").style.backgroundPosition = "-" + left * 32 + "px -" + top * 32 + "px";
    // sleep(1000);
    screen_last_left = left * 32;
    screen_last_top = top * 32;

    if (npc[0]['x'] >= left && npc[0]['x'] < left + screen_width && npc[0]['y'] >= top && npc[0]['y'] < top + screen_height) {
        show_char(npc[0]['x'] - left, npc[0]['y'] - top);
    }
}

function sleep(millis) {
    if (millis > 0) {
        setTimeout("sleep(" + (millis - 10) + ");", 10);
    }
}

function chat_send() {
    // Posts a message and retrieves the chat long again
    if (ajax_busy)
        return;

    ajax_busy = 1;

    http.open('get', "chat.php?m=" + document.getElementById("chatinput").value);

    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            result = http.responseText;

            if (result) {
                document.getElementById("chatinput").value = "";
                document.getElementById("convobox").innerHTML = result;
            } else {
                chat_send();
            }

            document.getElementById("convobox").scrollTop = document.getElementById("convobox").scrollHeight;

            ajax_busy = 0;
        }
    }

    http.send(null);
}

function chat_get() {
    // Retrieves a log of chat convos
    if (ajax_busy)
        return;

    ajax_busy = 1;

    http.open('get', "chat.php");

    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            var resize = (document.getElementById("convobox").scrollTop == document.getElementById("convobox").scrollHeight);
            result = http.responseText;

            if (result && result != document.getElementById("convobox").innerHTML) {
                if (chat_on == 1) document.getElementById("chatinput").value = "";
                document.getElementById("convobox").innerHTML = result;

                if (resize)
                    document.getElementById("convobox").scrollTop = document.getElementById("convobox").scrollHeight;
            } else {
                // Retry
                setTimeout("chat_get()", 1000);
            }

            ajax_busy = 0;
        }
    }

    http.send(null);
}

// Store your position in a database

function pos_sendrec() {
    // Posts a message and retrieves the chat long again
    if (ajax_busy)
        return 0;

    ajax_busy = 1;

    http.open('get', "step.php?x=" + pos_x + "&y=" + pos_y + "&id=" + player_id);

    http.onreadystatechange = function () {
        if (http.readyState == 4) {
            result = http.responseText;

            if (result) {
                // Place characters..?
                positions = result.split(' ');

                // erase_char(npc[0]['x'], npc[0]['y']);
                npc[0]['x'] = parseInt(positions[0]);
                npc[0]['y'] = parseInt(positions[1]);
            } else {
                pos_sendrec();
            }

            ajax_busy = 0;
        }
    }

    http.send(null);
}
