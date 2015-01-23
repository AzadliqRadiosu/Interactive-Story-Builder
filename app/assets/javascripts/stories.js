var story_id = -1;
var section_id = -1;
var item_id = -1;

var el_type = 'section';
var selectedType = 'story';
var method = 'n';
var tester = null;
var story_tree = null;
var section_types = ['content','fullscreen','slideshow','embed','youtube'];
$(document).ready(function() {

	$('.storytree-toggle').click(function(){
		var t = $(this).parent();
		var sidebarWidth = t.width();
		var newLeft = t.hasClass('o') ? -1*sidebarWidth : 0;
		var content = $('.builder-wrapper .content .workplace');
		t.animate({'left': newLeft},
			{
				duration:2000, 
				complete:function()
				{
					t.toggleClass('o c');	
				},
				step:function(a,b)
				{
					content.css('paddingLeft',sidebarWidth + a);
				}
			}
		);
	});

	$('.story-tree ul').on('click','li.story > .box > .title',function(e) {
		e.preventDefault();
		var par = $(this).parent().parent();
		story_id = par.attr('id');
		$('.story-tree ul li').removeClass('active');
		par.addClass('active');	    
      getObject('select','story');
	 	//getStory(0,-1);
	    return false;
	});

	$('.story-tree ul').on('click','li.item > .box > .title',function(e) {
		e.preventDefault();		
		var tmpId = $(this).parent().parent().attr('id');
		$('.story-tree ul li').removeClass('active');
		$('.story-tree ul li.item[id='+tmpId+']').addClass('active');	    
      getObject('select', 'section', tmpId);
	    //getStory(section_id);
	    return false;
	});
   $('.story-tree ul').on('click','li.item > .box > .collapser',function(e) {      
      e.preventDefault();
      var tmpId = $(this).parent().parent().attr('id');  
      var t = $('.story-tree ul li.item[id='+tmpId+']').toggleClass('open').hasClass('open');
      $(this).text( t ? "-" : "+");       
      $(this).parent().parent().children('ul').toggleClass("opened closed"); 
      return false;
   });

	$('.story-tree ul').on('click','li.item > ul > li.sub > div > .sub-l',function(e) {
		e.preventDefault();		
		var cur = $(this).parent().parent();
      var par = cur.parent().parent();
      var tmpId = par.attr('id');      
		var tmpSubId = cur.attr('id');
		var tmpType = par.attr('data-type');

		$('.story-tree ul li').removeClass('active');
		cur.parent().find('li#'+tmpSubId).addClass('active');   					
      getObject('select', tmpType, tmpId, tmpSubId);

		//getStory(section_id,item_id);
		if($( "#slideshowAssets" ).length > 0 )
		 $( "#slideshowAssets" ).sortable({ items: "> div" });
	    return false;
	});

  // when media type changes, show the correct file fields
	$('.story-viewer').on('change','input[name="medium[media_type]"]:radio',function(){
		if($(this).val()==1) {
		  $('#mediaImageBox').show();
		  $('#mediaVideoBox').hide();
	  }else {
		  $('#mediaImageBox').hide();
	    $('#mediaVideoBox').show();
    }
    // make sure the file fields are reset when the option changes
    $('form.medium input#mediaImage, form.medium input#mediaVideo').wrap('<form>').parent('form').trigger('reset');
    $('form.medium input#mediaImage, form.medium input#mediaVideo').unwrap();
	});

  $('.story-viewer').on('click', '#btnOlly', function(){
    ths = $('#embedMediaUrl');
	  url = $(ths).val();
    resetEmbedForm();
    
	  if (url.length > 0 && isUrl(url)){
      olly.embed(url, document.getElementById("embedMediaResult"), 'timerOllyCompelte', 'ollyFail');
	  }else{
      ollyFail();
	  }
	});

   $('.story-viewer').on('click', '#btnGetEmbed', function(e){
			
		var id = '';
 		var html = '';
 		var ok = false;
 		var u = $('#youtubeUrl').val();
		$('#youtubeResult').empty();
		$('#youtubeButtons').hide();
		$('#youtubeError').hide();

 		if(u != "")
 		{
 			if(u.length == 11)
 			{
					id = u;
					ok = true;
				}
				else 
				{
				var uri = u.match(/^(?:http(?:s)?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:(?:watch)?\?(?:.*&)?v(?:i)?=|(?:embed|v|vi|user)\/))([^\?&\"'>]+)/)
			  	if(typeof uri[1] !== 'undefined' && uri[1].length == 11)
			  	{
			    	id = uri[1]
			    	ok = true;
			  	}
				}

				if(ok)
				{
					var  pars = ($('#youtubeLoop').is(':checked') ? 'loop=1' : '') + ($('#youtubeInfo').is(':checked') == false ? '&showinfo=0' : '') +
		    ($('#youtubeCC').is(':checked') ? '&cc_load_policy=' + (self.cc ? '1' : '0') : '') + 
		    ( '&hl=' + $('#youtubePlayerLang').val()) + 
		    ( '&cc_lang_pref=' + $('#youtubeCCLang').val());
		    	if(pars[0] == '&')
	    		{
	    			pars = pars.substr(1,pars.length-1);
	    		}	

		  		html =  '<iframe width="640" height="360" src="http://www.youtube.com/embed/' + 
		      	    id + '?' + pars + '" frameborder="0" allowfullscreen class="embed-video embed-youtube"></iframe>';
   	    	$('#youtubeResult').html(html);
   	    	$('#youtubeButtons').show();
				}
				else
				{
			  $('#youtubeUrl').focus();
			  $('#youtubeError').show();
				}
 		}
		e.preventDefault();	
		return true;	
	});

  // when review menu item clicked, open modal 
  // and push in review key and story title
  $(document).on('click', '#btnReviewer', function(e){
		e.preventDefault();		
		
		var ml = $('#' + $(this).attr('data-modalos-id'));   
    var v = $('.navbar-storybuilder'); 
    ml.find('#review_instructions').html(ml.find('#review_instructions').html().replace('[title]', $(this).data('title')));        
    ml.find('#review_url').attr('src', $(this).data('reviewer-key')).html($(this).data('reviewer-key'));        
    ml.modalos({
    	topOffset: $(v).position().top + $(v).height() + 30       	        	        	      
    });

		return true;	
  });

  $(document).on('click', '#btnPublish', function(e){  	
		e.preventDefault();		
		var a = $(this);		
		$.ajax(
		{	
			dataType: "json",
			url: $(this).data('link')}).done(
			function(d) 
			{ 		
				if(typeof(d.e) !== 'undefined' && d.e)	
				{
               if(a.closest('.story-edit').length) a.closest('.story-edit').next('.story-message').html(d.msg).fadeIn(1000);
               else popuper(d.msg,'error');           
				}
				else
					a.find('span:last-child').text(d.title);							
			});	 							
		return true;	
  });
   $('.story-edit-menu ul.nav li > ul.dropdown-menu li').click(function(){$(this).closest('.story-edit').next('.story-message').html("").hide();});

    $(document).on('click', '.preview', function(e){  	
		e.preventDefault();		

        var ml = $('#' + $(this).attr('data-modalos-id'));           
        var v = $('.navbar-storybuilder');
        var type = $(this).data('type');
        var output = '';
        var opts = null;
        var opts_def = 
        {
        	topOffset: $(v).position().top + $(v).height() + 30,        	        
        	paddings :20,
        	contentscroll:false,         
        	width:722
        };
        if(type == 'image')
        {
    	 	output = "<img src='" +  $(this).data('image-path') + "' style='width:640px;'/>";
        }
        else if(type == 'video')
        {
        	output = "<video preload='auto' width='640px' height='auto' controls>" + 
        					"Your browser does not support this video." + 
        					"<source src='"+$(this).data('video-path')+ "' type='"+$(this).data('video-type')+"'>" +
    					  	"</video>";
         opts = {
            topOffset: $(v).position().top + $(v).height() + 30,                   
            paddings :20,
            contentscroll:false,
            width:722,
            before_close:function(t)
            {
               $(t).find('video').each(function(){ this.pause(); })
               $(t).find('audio').each(function(){ this.pause(); })               
            }
         };
        }
        else if(type == 'text')
    	{
    		output = $("#contentArticle").val();
    	}
    	else if(type=='story')
    	{
    		output = "<iframe height='100%' width='100%' src='"+$(this).data('link') + "?n=n"+"'></iframe>";
    		opts = {
				topOffset: $(v).position().top + $(v).height(),
	        	fullscreen:true,
	        	aspectratio:true,
	        	paddings :0,
	        	contentscroll:false,
             before_close:function(t)
            {              
               $(t).find("iframe").contents().find("video").each(function(){this.pause();})          
               $(t).find("iframe").contents().find("audio").each(function(){this.pause();})              
            }
    		};

    	}
    	if(opts===null) opts = opts_def;    	
        ml.html(output).modalos(opts);

		return true;	
  });

	$('.builder-wrapper .sidebar .story-tree').on('click','.tools .btn-up, .tools .btn-down',function()
	{
      var where = $(this).hasClass('btn-up') ? 'top' : 'bottom';
		var cur = $(this).closest('li');
		var sec_id = -1;
		var itm_id = -1;
		if(cur.hasClass('item'))
		{
			sec_id = cur.attr('id');
		}
		else
		{
			itm_id=cur.attr('id');
			var par = cur.parent().parent('li');
			sec_id = par.attr('id');
		}

		if(!(sec_id == -1 && itm_id == -1))
		{
			$.ajax
			({
				url: where,			  
				data: {'s' : sec_id, 'i': itm_id },
				type: "POST",			
	        	dataType: 'json'
			}).done(function(d) 
			{
				var secT = $('.story-tree ul li.item[id='+ sec_id + ']');
				if(itm_id == -1)
				{		
               if(where == 'top')
               {	 	
   			 		if(secT.prev().length)
   			 		{
   		 			  $(secT).insertBefore($(secT).prev());
   			 		}
               }
               else
               {
                  if( secT.next().length)
                  {
                    $(secT).insertAfter($(secT).next());
                  }
               }
		 		}
		 		else
		 		{
		 			subT = secT.find('ul li.sub[id='+itm_id+']');
               if(where == 'top')
               {  
   		 			if( subT.prev().length)
   			 		{
   		 			  $(subT).insertBefore($(subT).prev());
   			 		}
               }
               else
               {
                  if( subT.next().length)
                  {
                    $(subT).insertAfter($(subT).next());
                  }
               }
		 		}	
			}).error(function(e){ popuper(gon.fail_change_order,"error");});	
		} 	
	});
	
	$('.story-viewer').on("click",'#btn-up-slideshow', function() {
  			var secT = $(this).parents('.fields');
  			if( !secT.prev().length) return false;
  			
  			// if this is a new record and no id exists yet, 
  			// don't make ajax call, just move it
			  if ($(this).data('id') == 0){
			    if( secT.prev().length)
	     		{
     			   $(secT).insertBefore($(secT).prev());
	     		}				
			  }else{
			    $.ajax
			    ({
				    url: 'up_slideshow',			  
				    data: {asset_id: $(this).data('id')},
				    type: "POST",			
		            dataType: 'json'

			    }).done(function(d) 
			    {
				    if( secT.prev().length)
		     		{
	     			   $(secT).insertBefore($(secT).prev());
		     		}				
						
			    }).error(function(e){ popuper(gon.fail_change_order,"error");});	
			  }
	});
		$('.story-viewer').on("click",'#btn-down-slideshow', function() {
			var secT = $(this).parents('.fields');
			if( !secT.next().length) return false;

			// if this is a new record and no id exists yet, 
			// don't make ajax call, just move it
		  if ($(this).data('id') == 0){
			  if( secT.next().length)
	   		{
   			  $(secT).insertAfter($(secT).next());
	   		}
      } else {
			  $.ajax
			  ({
				  url: 'down_slideshow',			  
				  data: {asset_id: $(this).data('id')},
				  type: "POST",			
		          dataType: 'json'

			  }).done(function(d) 
			  {
				  if( secT.next().length)
		   		{
	   			  $(secT).insertAfter($(secT).next());
		   		}
						
			  }).error(function(e){ popuper(gon.fail_change_order,"error");});	
      }


	});

   $('.builder-wrapper .sidebar .story-tree').on('click','.tools .btn-remove',function()		
   {	
      var cur = $(this).closest('li');
      var par = cur;
      var id = -1;
      var sub_id = -1;
      var isItem = false;
      var type = cur.data('type');
      var pars = { '_method':'delete' };

      if(type.indexOf('_item')!= -1)
      {
         isItem = true;
         type = type.replace('_item','');
          sub_id=cur.attr('id');
         par = cur.parent().parent('li');
         id = par.attr('id');
         pars['sub_id'] = sub_id;
      }
      else 
      {
         type = 'section';
         id = cur.attr('id');  
      }
      pars['_id'] = id;
      pars['type'] = type;
   
		if (!confirm(gon.confirm_delete)) return true;

		$.ajax
		({
			url: 'remove',			  
			data: pars,
			type: "POST",			
         dataType: 'json'
		})
      .done(function(d) 
		{
         if(!error(d))
         {
   		 	//var secT = $('.story-tree ul li.item[id='+ id + ']');
   			if(isItem)
   			{
   				if(cur.find('ul li').length == 1)
   					cur.parent().remove();		
   				else cur.remove();		
   			}
   			else 
   			{	
   				par.remove();		
   			}

   			$('.builder-wrapper .content .workplace .viewer').html('');            
            if(cur.hasClass('active'))
            {
               item_id = -1;
               section_id = -1;
            }
         }
		})
      .error(function(e){ popuper(gon.fail_delete,"error"); });
	});


   $('.btn-create-section').click(function(){  getObject('create','section'); });

   $('.builder-wrapper .sidebar .story-tree').on('click','li.item > ul > .btn-create',function()     
   {
      var cur = $(this).closest('li');
      var id = cur.attr('id');
      var type = cur.data('type');
		if(id == -1) { alert(gon.msgs_select_section); return true; }

		if( ['content','slideshow','embed_media','youtube'].indexOf(type) != -1 && cur.has('ul li').length==1 )
		{			
			alert(gon.msgs_one_section_general);
		}
		else 
		{		
         getObject('create', type, id);
		}	
	});

  // trigger the add content form if no sections exist
   if (gon.has_no_sections == true)
   {
      getObject('create','section');
   }

  var was_title_box_length, was_permalink_box_length = 0;
  
  // if the title changes and there is no permalink or the permalink was equal to the old title, 
  // add the title into the permalink show field
  $(document).on('keyup','input#storyTitle', debounce(function(){
      if (($('input#storyPermalinkStaging').val() != '' && $('input#storyPermalinkStaging').val() !== $(this).data('title-was')) || 
          $(this).val().length == was_title_box_length) {
          
        return;
      } else {
        $(this).data('title-was', $(this).val());
        $('input#storyPermalinkStaging').val($(this).val());
        check_story_permalink($(this).val());
      }

      was_title_box_length = $(this).val().length;
  
  }));
  
  // if the permalink staging field changes, use the text to generate a new permalink
  $(document).on('keyup','input#storyPermalinkStaging', debounce(function () {
    // if text length is 1 or the length has not changed (e.g., press arrow keys), do nothing
    if ($(this).val().length == 1 || $(this).val().length == was_permalink_box_length) {
      return;
    } else {
      check_story_permalink($(this).val());
    }

    was_permalink_box_length = $(this).val().length;
  }));
  

 

  // add autocomplete for tags
  if ($('#storyTagList').length > 0){
    $('#storyTagList').tokenInput(
      gon.tag_search,
      {
        method: 'POST',
        minChars: 2,
        theme: 'facebook',
        allowCustomEntry: true,
        preventDuplicates: true,
        prePopulate: $('#storyTagList').data('load'),
        hintText: gon.tokeninput_tag_hintText,
        noResultsText: gon.tokeninput_tag_noResultsText,
        searchingText: gon.tokeninput_searchingText
      }
    ); 
  }
  
  // add autocomplete for collaborator search
  if ($('form#collaborators #collaborator_ids').length > 0){
    $('form#collaborators #collaborator_ids').tokenInput(
      gon.collaborator_search,
      {
        method: 'POST',
        minChars: 2,
        theme: 'facebook',
        allowCustomEntry: true,
        preventDuplicates: true,
        prePopulate: $('form#collaborators #collaborator_ids').data('load'),
        hintText: gon.tokeninput_collaborator_hintText,
        noResultsText: gon.tokeninput_collaborator_noResultsText,
        searchingText: gon.tokeninput_searchingText,
        resultsFormatter: function(item){ 
          return "<li><img src='" + item.img_url + "' title='" + item.name + "' height='28px' width='28px' /><div style='display: inline-block; padding-left: 10px;'><div>" + item.name + "</div></div></li>" 
        },        
        tokenFormatter: function(item) { 
          if (item.img_url == undefined){
            return "<li><p>" + item.name + "</p></li>" ;
          }else{
            return "<li><p><img src='" + item.img_url + "' title='" + item.name + "' height='50px' width='50px' /></p></li>" ;
          }
        }
      }
    ); 
  }
  
  // remove collaborator
  $('#current-collaborators a.remove-collaborator').click(function(e){
		e.preventDefault();		
    var ths = this;
    $.ajax
    ({
	    url: $(ths).data('url'),			  
	    data: {user_id: $(ths).data('id')},
	    type: "POST",			
      dataType: 'json'
    }).done(function(d) {
      var dng = 'alert-danger';
      var info = 'alert-info';
      var cls = dng;
      if (d.success){
        // hide user
        $(ths).closest('li').fadeOut();
        cls = info;
      }
      // show message
      $('li#remove-collaborator-message').show().removeClass(dng).removeClass(info).addClass(cls).html(d.msg);
    });
  });

  $('.story-tree ul li.story > .box > .title').trigger('click');


  $('#translateFrom').change(function(){
  		var fromLang = $(this).selectpicker('val');
  		var toLang = $('#translateTo').selectpicker('val');
  		if(fromLang == toLang)
  		{
  			$('#translateTo option').each(function(i,d){ 
  				if(d.value != fromLang)
  				{
  				 	$('#translateTo').val(d.value);
  				 	$('#translateTo').selectpicker('refresh');
  				 	gon.transalte_to = d.value;
  					return false;
  				}
		 	});
  		}
	 	gon.transalte_from = fromLang;
      getObject('select',selectedType, section_id, item_id, 1);
  		// call new language
  });
    $('#translateTo').change(function(){
  		var fromLang = $('#translateFrom').selectpicker('val');
  		var toLang = $(this).selectpicker('val');
  		if(fromLang == toLang)
  		{
  			gon.transalte_from = $('#translateFrom').attr('data-default');		
  			$('#translateFrom').val(gon.transalte_from);
		 	$('#translateFrom').selectpicker('refresh');  	

  		}
	 	gon.transalte_from = toLang;
      getObject('select',selectedType, section_id, item_id, 2);
  		// call new language
  });

  story_tree = $('.story-tree');

});

function show_story_permalink(d){
  var div = '#story_permalink';
  // show the permalink
  if ($(div + ' > span.check_permalink').length == 0){
    // not exists, so create div
    $(div).html('<span class="check_permalink"></span>');
  }else{
    // exists, so clear out
    $(div + ' > span.check_permalink').empty();
  }
  
  // add the result
  var html = '';
  if (d.is_duplicate == true){
    $(div + ' > span.check_permalink').addClass('duplicate').removeClass('not_duplicate');
    html = gon.story_duplicate;
  }else{
    $(div + ' > span.check_permalink').addClass('not_duplicate').removeClass('duplicate');
  }
  html += ' ' + gon.story_url + ' /' + d.permalink;
  
  $(div + ' > span.check_permalink').html(html);
}

function check_story_permalink(text){
  if (text != ''){
    var data = {text: text};
    var url = window.location.href.split('/');
    if (url[url.length-1] == 'edit'){
      data.id = url[url.length-2];
    }
    $.ajax
    ({
	    url: gon.check_permalink,			  
	    data: data,
	    type: "POST",			
      dataType: 'json'
    }).done(function(d) { 
      // record the new permalink
      $('input#storyPermalink').val(d.permalink);

      // show the permalink 
      show_story_permalink(d);
    });
  }else{
    $('#story_permalink > span.check_permalink').empty().removeClass('not_duplicate').removeClass('duplicate');
  }
}


function resetEmbedForm(){
  timerCount = 0;
  $('#embedMediaCode').empty();
  $('#embedMediaResult').empty();
  $('#embedMediaButtons').hide();
  $('#embedMediaError').hide();
}
function ollyFail(){
  resetEmbedForm();
  $('#embedMediaUrl').focus();
  $('#embedMediaError').show();
}
function timerOllyCompelte() {
timerCount += 1;
  if ($('#embedMediaResult').html().length > 0){
    $('#embedMediaCode').val($('#embedMediaResult').html());
    $('#embedMediaButtons').show();
  }else{
    setTimeout(function() {
        timerOllyCompelte();
    }, 500)
  }
}

function isUrl(s) {
  var regexp = /(http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
  return regexp.test(s);
}

function getObject(method, type, id, sub_id, which)
{
   method = typeof method !== 'undefined' ? method : '';  // n - new , s - select, r - remove, a - add
   type = typeof type !== 'undefined' ? type : '';  
   id = typeof id !== 'undefined' ? id : -1;
   sub_id = typeof sub_id !== 'undefined' ? sub_id : -1;
   which = typeof which !== 'undefined' ? which : 0;
   selectedType = type;

//   console.log(method,type,id,sub_id,which);
   
   var pars = { 'which': which };   

   if(type == 'story')
   {

   }
   else if(type=='section')
   {
      section_id = id;
      item_id = -1;

      if(method == 'create')
      {         
         section_id = -1;
         $('.story-tree ul li').removeClass('active');
      }
   }
   else if(section_types.indexOf(type) != -1)
   {
      section_id = id;
      item_id = sub_id;
      pars['sub_id'] = sub_id;
   }
   else return false;

   pars['_id'] = section_id;
   pars['method'] = method;
   pars['type'] = type;

   if(gon.translate) { pars['trans'] = {'from':gon.translate_from,'to':gon.translate_to}; }  

// request data
   $.ajax
      ({       
        url: 'get_data',
        data: pars,
        dataType: 'script',
        cache: true 
      }).error(function(e){console.log(e)}).done(function(){         
         if(el_type!='section' && method != 'n')
            $('.form-title .form-title-text').text($('.story-tree > ul > li.item[id='+section_id+'].open > ul > li.sub.active > div > .sub-l').text() + ": " + $('.form-title .form-title-text').text());
      });

   return true;   
}
function remove_fields(link) {
  $(link).prev("input[type=hidden]").val("1");
  $(link).closest(".fields").hide();
}

function add_fields(link, association, content) {
  	var new_id = new Date().getTime();
  	var regexp = new RegExp("new_" + association, "g")
	$('#slideshowAssets').append(content.replace(regexp, new_id));
}
function error(v)
{
   return (v == null || typeof v === 'undefined' || !v.hasOwnProperty('e') || v.e == true);
}
function change_tree(d)
{
   var li = $("<li id='"+d.id+"' data-type='"+d.type+"' class='item open'>" + 
               "<div class='box'>" + 
                  "<div class='collapser'>-</div>" + 
                  "<div class='s "+d.icon+"'></div>" + 
                  "<div class='title'><span>"+d.title+"</span></div>" + 
                  d.tools + 
                  "<div class='storytree-arrow'><div class='arrow'></div></div>" + 
               "</div>" +
               "<ul class='opened'>"+d.add_item+"</ul>" + 
            "</li>");
   story_tree.find('ul li').removeClass('active'); // todo is it enough for reseting or section_id should be changed too ???
   story_tree.find('> ul').append(li);   
   li.find('ul > .btn-create').trigger('click');
   story_tree.animate({ scrollTop: story_tree.height()}, 1000);
}
function change_sub_tree(d)
{
   var section = story_tree.find('ul li.item[id='+ d.id + ']');
   var li = $("<li id='"+d.sub_id+"' class='sub' data-type='"+d.type+"_item'><div><div class='sub-l'>"+d.title+"</div><div class='storytree-arrow'><div class='arrow'></div></div></div></li>");  
   if(d.type != 'fullscreen')
   {
      section.find('ul button').remove();
   }
   section.find('ul').append(li);
   
   story_tree.find('ul li').removeClass('active');   
   li.find('.sub-l').trigger('click');
}