$( function() {
	$( "#tags" ).autocomplete({
		source: [
			{"label":"شریعتی","value":"Shariati"},
			{"label":"خیابان بوعلی","value":"Buali"},
			{"label":"شهدا","value":"Shohada"},
			{"label":"اکباتان","value":"Ekbatan"},
			{"label":"باباطاهر","value":"BabaTaher"},
			{"label":"تختی","value":"Takhti"},
			{"label":"بلوار مدنی","value":"Madani-Blvd"},
			{"label":"بلوار جولان","value":"Jowlan-Blvd"},
			{"label":"بلوار بهشت","value":"Behesht-Blvd"},
			{"label":"بلوار 15 فروردین","value":"15Far-Blvd"},
			{"label":"بلوار موشک","value":"15Far-Blvd"},
			{"label":"بلوار شهید فهمیده","value":"Fahmide-Blvd"},
			{"label":"بلوار شهید زمانی","value":"Zamani-Blvd"},
			{"label":"بلوار خواجه رشید","value":"KhajeRashid-Blvd"},
			{"label":"بلوار کاشانی","value":"Kashani-Blvd"},
			{"label":"شهرک شهید بهشتی","value":"SH-Beheshti"},
			{"label":"شهرک مدنی","value":"SH-Madani"},
			{"label":"شهرک فرهنگیان","value":"SH-Farhangian"},
			{"label":"شهرک الوند","value":"SH-Alvand"},
			{"label":"شهرک مدرس","value":"SH-Modarres"},
			{"label":"کوی شهید چمران","value":"Dr-Chamran"},
			{"label":"کوی محمدی (فقیره)","value":"Faghire"},
			{"label":"کوی پردیس","value":"Pardis"},
			{"label":"کوی متخصصین","value":"Motakhasesin"},
			{"label":"کوی استادان","value":"Ostadan"},
			{"label":"کوی اعتمادیه","value":"Etemadie"},
			{"label":"کوی امیرکبیر","value":"AmirKabir"},
			{"label":"ایستگاه","value":"istgah"},
			{"label":"خیابان میرزاده عشقی","value":"Mirzade"},
			{"label":"مهدیه","value":"Mahdie"},
			{"label":"سعیدیه","value":"Saiedie"},
			{"label":"کولانج","value":"Koolanaj"},
			{"label":"بین النهرین","value":"Beyn-Nahrein"},
			{"label":"سیزده خانه","value":"Buali"},
			{"label":"جهاد","value":"Jahad"},
			{"label":"کبابیان","value":"Kababian"},
			{"label":"آقاجانی بیگ","value":"Aqajani"},
			{"label":"طالقانی","value":"Taleqani"},
			{"label":"صدف","value":"Sadaf"},
			{"label":"شکریه","value":"Shokrie"},
			{"label":"هنرستان","value":"Honarestan"},
			{"label":"پاسداران","value":"Pasdaran"},
			{"label":"خیابان اراک","value":"Arak"},
			{"label":"حصار امام خمینی","value":"Hasar"},
			{"label":"خیابان مزدقینه","value":"Mazdaqine"},
			{"label":"شهر ماشین","value":"ShahreMashin"},
			{"label":"12 متری شیر سنگی","value":"ShirSangi"},
			{"label":"خیابان صنعت","value":"Sanat"},
			{"label":"خیابان جوادیه","value":"Jawadie"},
			{"label":"خیابان آزاد","value":"Azad"},
			{"label":"خیابان آرام","value":"Aram"},
			{"label":"پیشاهنگی","value":"Pishahangi"},
			{"label":"خیابان شهناز","value":"Shahnaz"},
			{"label":"منوچهری","value":"Manuchehri"},
			{"label":"چرم سازی","value":"Charmsazi"},
			{"label":"خیابان امیرکبیر","value":"AmirKabir-St"},
			{"label":"کلپا","value":"Kolapa"}
		],
		delay: 100,
		search: function(event,ui) {
			$(".load").fadeIn();
		},
		response: function(event,ui){
			$(".load").fadeOut();
		},
		select: function( event, ui ) {
			event.preventDefault();
			window.location = 'http://localhost/rahatfood/public/area/'+ui.item.value+'/'+ui.item.label;
		},
		focus: function(event, ui) {
			event.preventDefault();
		}
	});
} );