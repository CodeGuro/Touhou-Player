var songs = new Array()
var songs_div
var songsc_div
var hidden = true
var current_page = 1
var pages = null
var loaded_pages = new Array()
var song = null
var search_string=""
var player
var over_event_registered = false
var img_url = "/images/default.png"
var dragging = false
var clickign = true
var mouse_down = false
var last_target = null
var orig_target = null

var single_click = true

var page_scrolling = false

var scroll = 0

/**
 * Concatenates the values of a variable into an easily readable string
 * by Matt Hackett [scriptnode.com]
 * @param {Object} x The variable to debug
 * @param {Number} max The maximum number of recursions allowed (keep low, around 5 for HTML elements to prevent errors) [default: 10]
 * @param {String} sep The separator to use between [default: a single space ' ']
 * @param {Number} l The current level deep (amount of recursion). Do not use this parameter: it's for the function's own use
 */
function print_r(x, max, sep, l) {

  l = l || 0;
  max = max || 10;
  sep = sep || ' ';

  if (l > max) {
    return "[WARNING: Too much recursion]\n";
  }

  var
    i,
    r = '',
    t = typeof x,
    tab = '';

  if (x === null) {
    r += "(null)\n";
  } else if (t == 'object') {

    l++;

    for (i = 0; i < l; i++) {
      tab += sep;
    }

    if (x && x.length) {
      t = 'array';
    }

    r += '(' + t + ") :\n";

    for (i in x) {
      try {
        r += tab + '[' + i + '] : ' + print_r(x[i], max, sep, (l + 1));
      } catch(e) {
        return "[ERROR: " + e + "]\n";
      }
    }

  } else {

    if (t == 'string') {
      if (x == '') {
        x = '(empty)';
      }
    }

    r += '(' + t + ') ' + x + "\n";

  }

  return r;

};

var jwref = null;

function jwplayerLoaded(id) {
  jwref = id//$(id).get())
  jwplayer(jwref).onComplete(song_over)
}

function change_volume(percentage, e) {
  var volume = Math.round((Math.pow(100, (percentage*100)/100)-1)*(100/99));
  jwplayer(jwref).setVolume(volume)
}

function store_volume(percentage, e) {
  $.get("/songs/settings?volume=" + Math.round(percentage*100))
  change_volume(percentage, e)
}

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
    return vars;
}

var_dump = print_r;

function load_songs() {
  if(pages == null) {
      $.getJSON('/songs/pages.json?search='+search_string, function(data) {
          songs_div.empty()
          pages = data
          //if(pages == 0) {
            //songs_div.empty()
          //} else
          if(pages > 1) {
            for(var i = 1; i <= pages; i++) {
              songs_div.append('<div id="p'+i+'" class="page"><img src="/images/loader.gif" class="loader" /><img src="/images/loader.gif" class="loader" /></div>')
            }
          } else if(pages == 1){
            songs_div.append('<div id="p1"><div id="loading"><img src="/images/loading.gif" /></div></div>')
          }
          if(search_string == "") {
            songsc_div.attr("scrollTop", Math.floor(Math.random()*(songsc_div.attr("scrollHeight")-songsc_div.height())))
            load_pages()
          } else {
            load_pages()
          }
      })
  }
  return
/*
  if(load_more && scroll <= 600) {
    scroll = songs_div.attr("scrollHeight") - songs_div.height() - songs_div.attr("scrollTop") 
    load_more = false
    //$.get("/songs?page=" + current_page + "&search="+encodeURI(search_string), null, load_songs, "script")
    current_page++
  }*/
}

function load_page(page) {
  if(page < 1) return;
  if(page > pages) return;
  if(loaded_pages[page])  return;
  loaded_pages[page] = true
  $.get("/songs.js?page=" + page + "&search="+search_string, null, null, "script")
}

function load_pages() {
  page_scrolling = false
  scroll = songsc_div.attr("scrollTop")
  current_page = Math.floor(scroll/840)+1
  load_page(current_page)
  load_page(current_page+1)
  load_page(current_page-1)
  load_page(current_page+2)
  load_page(current_page-2)
}



function show_queue() {
  if(!hidden)
    return
  if(!$("#queue_hide").attr("checked")) {
    $("#playlist").width("49%")
    $("#queue").show()
    hidden = false
  }
}

function hide_queue() {
  if(hidden)
    return
  if(!$("#queue_show").attr("checked")) {
    $("#playlist").width("100%")
    $("#queue").hide()
    hidden = true
  }
}

function debug(s) {
  $("#debug").append("<br /><pre>" + print_r(s, 4, '-') + "</pre>")
}
function debug_raw(s) {
  $("#debug").append("<br /><pre>" + s + "</pre>")
}
function play_song(id) {
  song = songs[id]
  //niftyplayer('player').loadAndPlay(song.filename)
  jwplayer(jwref).load({file: song.filename})
  jwplayer(jwref).play(true);
  $(".song_playing").removeClass("song_playing")
  $(".song[data-song_id="+id+"]").addClass("song_playing")
  $("#current_artist").html(song.artist)
  $("#current_album").html(song.album + " ("+song.date+")")
  if(search_string == "") {
    $("#current_title").html(song.tracknum + ". " +song.title + ' <a href="' + window.location.pathname.replace(/\?.*/, "") + "?id=" + id + '">Link</a>')
  } else {
    $("#current_title").html(song.tracknum + ". " +song.title + ' <a href="' + window.location.pathname.replace(/\?.*/, "") + "?id=" + id + '&search='+ search_string +'">Link</a>')
  }
  $("#current_table").show()
  //if(!over_event_registered) {
    //niftyplayer('player').registerEvent("onSongOver", "song_over()")
    //over_event_registered = true
  //}
  if(song.image != "") {
    $('#album_art_div a img').attr('src',song.thumb)
    img_url = song.image
    $('#album_art_div a').attr('href',img_url)
  } else {
    $('#album_art_div a img').attr('src',"/images/default_thumb.png")
    img_url = "/images/default.png"
    $('#album_art_div a').attr('href',img_url)
  }
}
function get_and_play_song(id) {
  try {
    //if(niftyplayer('player').getState()) {
    if(jwref) {
      $.getJSON('/songs/find.json?id='+id, function(data) {
        songs[data.id] = data
        play_song(data.id)
      })
    } else {
      setTimeout(function(){get_and_play_song(id)}, 300)
    }
  } catch(err) {
    setTimeout(function(){get_and_play_song(id)}, 300)
  }
}

function reset_clicked() {
  $(".song_active").removeClass("song_active")
}

function song_over() {
  $(".song_playing").removeClass("song_playing")
  var size = $("#queue_table tr").size()
  if(size > 0) {
    var target = $("#queue_table tr:first");
    var id = target.attr("data-song_id")
    play_song(id)
    target.remove()
    save_queue()
    if(size == 1)
      hide_queue()
  } else {
    hide_queue()
    if($("#after_stop").attr("checked")) {
      $("#current_table").hide()
      jwplayer(jwref).load({file:""});
      jwplayer(jwref).play(true);
      //niftyplayer('player').load("")
    } else if($("#after_next").attr("checked")) {
      $.getJSON('/songs/'+(song.id)+'/next.json?search='+search_string, function(data) {
          songs[data.id] = data
          play_song(data.id)
      })
    } else {
      $.getJSON('/songs/random.json?search='+search_string, function(data) {
          songs[data.id] = data
          play_song(data.id)
      })
    }
      
  }
}

function save_queue() {
  $("#queue_table").tableDnDUpdate();
  queue = ""
  $("#queue_table tr").each(function(index) {
    queue += $(this).attr("data-song_id") + ","
  })
  $.get("/songs/save_queue?queue="+queue)
}

function enqueue(target) {
  var id = parseInt(target.attr("data-song_id"))
  //if(niftyplayer('player').getState() == "empty" || $("#click_play").attr("checked"))
  if(jwplayer(jwref).getState() == "IDLE" || $("#click_play").attr("checked"))
    play_song(id)
  else {
    target.addClass("song_active")
    setTimeout("reset_clicked()", 100);
    var new_cell = '<tr class="' + target.attr("class") + '" data-song_id="'+id+'"><td class="song_attr song_artist"><a href="" class="queue_del_link">x</a> '+songs[id].artist+'</td><td class="song_attr song_date">'+songs[id].date+'</td><td class="song_attr song_album">'+songs[id].album+'</td><td class="song_attr song_tracknum">'+songs[id].tracknum+'</td><td class="song_attr song_title">'+songs[id].title+'</td><td class="song_attr song_duration">'+songs[id].duration+'</td></tr>'
    $("#queue_table").append(new_cell)
    save_queue()
    show_queue()
  }
}
function enqueue_load_queue(id) {
  var new_cell = '<tr class="song song_active" data-song_id="'+id+'"><td class="song_attr song_artist"><a href="" class="queue_del_link">x</a> '+songs[id].artist+'</td><td class="song_attr song_date">'+songs[id].date+'</td><td class="song_attr song_album">'+songs[id].album+'</td><td class="song_attr song_tracknum">'+songs[id].tracknum+'</td><td class="song_attr song_title">'+songs[id].title+'</td><td class="song_attr song_duration">'+songs[id].duration+'</td></tr>'
  $("#queue_table").append(new_cell)
}
function disableSelection(target){
if (typeof target.onselectstart!="undefined") //IE route
    target.onselectstart=function(){return false}
else if (typeof target.style.MozUserSelect!="undefined") //Firefox route
    target.style.MozUserSelect="none"
else //All other route (ie: Opera)
    target.onmousedown=function(){return false}
    target.style.cursor = "default"
}

function resize_height() {
  $("#container").height($(window).height()-40)
  $(".list_container").height($(window).height()-160)
}

function song_click(event) {
  var target = null
  if ($(event.target).is('.song')) {
    if($("#click_info").attr("checked")) {return;}
    target = $(event.target)
  } else if ($(event.target).is('.song_attr')) {
    if($("#click_info").attr("checked")) {
      if($(event.target).is('.song_title') || $(event.target).is('.song_artist') || $(event.target).is('.song_album')) {
        $("#search_field").val(event.target.innerHTML)
        //$("#search_form").submit()
      }
      return
    }
    target = $(event.target).parent()
  }
  if(target) {
    enqueue(target)
  }
}

function queue_click(event) {
  var target = null

  if ($(event.target).is('.queue_del_link')) {
    target = $(event.target).parent().parent()
  }
  if(target) {
    target.remove()
    save_queue()
    if($("#queue_table tr").size() == 0) {
      hide_queue()
    }
    return false
  }
  if ($(event.target).is('.song')) {
    target = $(event.target)
  } else if ($(event.target).is('.song_attr')) {
    target = $(event.target).parent()
  }
  if(target) {
    var id = parseInt(target.attr("data-song_id"))
    play_song(id)
    target.remove()
    save_queue()
    if($("#queue_table tr").size() == 0) {
      hide_queue()
    }
  }
  return false
}

var volumeslider = null

$(function() {
  //document.onselectstart = function(){return false}
  disableSelection(document.getElementById("player_container"))
  volumeslider = $.fn.jSlider({
    renderTo: '#volumeslider',
    size: { barWidth: 256, sliderWidth: 5 },
    onChanging: change_volume,
    onChanged: store_volume,
  })

  /*$('#album_art_div a img').click(function() {
    $('#album_art_div a').attr('href',img_url)
  })*/
  songs_div = $('#songs')
  songsc_div = $('#song_container')
  disableSelection(document.getElementById("songs"))
  disableSelection(document.getElementById("queues"))
  $("#queues").dblclick(function(event) {
    if(!single_click)
      return queue_click(event)
  })
  $("#queues").click(function(event) {
    if(single_click) {
      if(dragging && !clicking) // disable for double clicking
        return false
      return queue_click(event)
    }

  })
  $('#songs').mouseleave(function(event) {
    last_target = null
    orig_target = null
    mouse_down = false
    setTimeout(function() {dragging = false}, 300);
  })
  $('#songs').mouseup(function(event) {
    last_target = null
    orig_target = null
    mouse_down = false
    setTimeout(function() {dragging = false}, 300);
  })
  $('#songs').mousemove(function(event) {
    var target = null
    if ($(event.target).is('.song')) {
      target = $(event.target)
    } else if ($(event.target).is('.song_attr')) {
      target = $(event.target).parent()
    }
    if(target && last_target) {
      if(last_target && last_target != target.attr('id')) {
        last_target = target.attr('id')
        enqueue(target)
      }
    }
    if(target && orig_target) {
      if(orig_target != target.attr('id')) {
        last_target = target.attr('id')
        enqueue($("#"+orig_target))
        enqueue(target)
        dragging = true
        orig_target = null
      }
    }
  })
  $('#songs').mousedown(function(event) {
    if(!$("#click_queue").attr("checked"))
      return
    var target = null
    if ($(event.target).is('.song')) {
      target = $(event.target)
    } else if ($(event.target).is('.song_attr')) {
      target = $(event.target).parent()
    }
    if(target)
      orig_target = target.attr("id")
  })
  $('#songs').click(function(event) {
    if(single_click)
      return song_click(event)
  })
  $('#songs').dblclick(function(event) {
    if(!single_click)
      return song_click(event)
  })
  $("#current_artist").click(function(event) {
    $("#search_field").val(song.artist)
    $("#search_form").submit()
  })
  $("#current_album").click(function(event) {
    $("#search_field").val(song.album)
    $("#search_form").submit()
  })
  $("#current_title").click(function(event) {
    $("#search_field").val(song.title)
    $("#search_form").submit()
  })
  $("#clear_link").click(function(event) {
    table = $("#queue_table")
    table.empty()
    save_queue()
    hide_queue()
    return false
  })
  $("#next_link").click(function() {
    song_over()
    return false
  })
  $("#queue_default").click(function() {
    if($("#queue_table tr").size() > 0) {
      show_queue()
    } else {
      hide_queue()
    }
  })
  $("#queue_show").click(function()    { show_queue();$.get("/songs/settings?queue=show") })
  $("#queue_hide").click(function()    { hide_queue();$.get("/songs/settings?queue=hide") })
  $("#queue_default").click(function() { $.get("/songs/settings?queue=default") })
  $("#click_queue").click(function()   { $.get("/songs/settings?click=queue") })
  $("#click_play").click(function()    { $.get("/songs/settings?click=play") })
  $("#click_info").click(function()    { $.get("/songs/settings?click=info") })
  $("#after_stop").click(function()    { $.get("/songs/settings?after=stop") })
  $("#after_random").click(function()  { $.get("/songs/settings?after=random") })
  $("#after_next").click(function()    { $.get("/songs/settings?after=next") })
  $("#search_form").submit(function() {
    songs_div.empty()
    songs_div.append('<div id="loading"><img src="/images/loading.gif" /><div>')
    search_string = encodeURI(jQuery.trim($("#search_field").val()))
    $("#search_link").attr("href", window.location.pathname.replace(/\?.*/, "") + "?search=" + encodeURI(jQuery.trim($("#search_field").val())))
    current_page = 1
    pages = null
    loaded_pages = new Array()
    load_songs()
    songsc_div.attr("scrollTop", 0)
    return false
  })
  $('#song_container').scroll(function(){
    //if(songsc_div.attr("scrollHeight") - songsc_div.height() - songsc_div.attr("scrollTop") <= 0)
    if(!page_scrolling) {
      page_scrolling = true
      setTimeout("load_pages()", 1000)
    }
  })
  urlvars = getUrlVars()
  if(urlvars["search"]) {
    search_string = urlvars["search"]
    $("#search_link").attr("href", window.location.pathname.replace(/\?.*/, "") + "?search=" + encodeURI(jQuery.trim($("#search_field").val())))
    $("#search_field").val(decodeURI(search_string))
  }
  if(urlvars["id"]) {
    get_and_play_song(urlvars["id"])
  }
  load_songs()
  $.get("/songs/load_queue", null, null, "script")
  $(function() {
    $('#album_art_div a').lightBox({fixedNavigation:false});
  });
  $("#queue_table").tableDnD({
    onDragStart: function(table, row) {
      dragging = true
      clicking = true
      setTimeout(function() {clicking = false}, 200);
    },
    onDrop: function(table, row) {
      setTimeout(function() {dragging = false}, 300);
    }
  })
  resize_height()
  if($("#queue_show").attr("checked")) {
    show_queue()
  }
  $(window).bind('resize', resize_height);

  $.getJSON('/songs/get_settings.json', function(data) {
    if(data[0])
      $("#after_"+data[0]).attr("checked", true)
    else
      $("#after_random").attr("checked", true)
    if(data[1])
      $("#click_"+data[1]).attr("checked", true)
    else
      $("#click_queue").attr("checked", true)
    if(data[2])
      $("#queue_"+data[2]).attr("checked", true)
    else
      $("#queue_default").attr("checked", true)
    if(data[2] == "show") show_queue()
    if(data[3] !== null)
    {
      change_volume(data[3]/100)
      volumeslider.setSliderValue(data[3]/100)
    }
  })
})
