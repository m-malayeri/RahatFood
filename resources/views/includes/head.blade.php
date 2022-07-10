		<title>راحت فود @yield('title')</title>

		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="csrf-token" content="{{ csrf_token() }}">
		
		<link rel="icon" href="{{ URL::asset('favicon.ico') }}">
			
		<!-- CSS -->
		<link rel="stylesheet" href="{{ URL::asset('css/bootstrap.css') }}">
		<link rel="stylesheet" href="{{ URL::asset('css/font-awesome.css') }}">
		<link rel="stylesheet" href="{{ URL::asset('css/jquery-ui.css') }}">
		<link rel="stylesheet" href="{{ URL::asset('css/app.css') }}">
		<link rel="stylesheet" href="{{ URL::asset('css/star-rating.css') }}">
		<link rel="stylesheet" href="{{ URL::asset('css/lightbox.css') }}">
		
		<!-- JavaScript -->
		<script src="{{ URL::asset('js/jquery-3.1.1.min.js') }}"></script>
		<script src="{{ URL::asset('js/jquery-ui.js') }}"></script>
		<script src="{{ URL::asset('js/areas.js') }}"></script>
		<script src="{{ URL::asset('js/bootstrap.js') }}"></script>
		<script src="{{ URL::asset('js/cart.js') }}"></script>
		<script src="{{ URL::asset('js/star-rating.js') }}"></script>
		<script src="{{ URL::asset('js/lightbox.js') }}"></script>
			
		<!--[if lt IE 9]>
			<script src="https://oss.maxcdn.com/html5shiv/3.7.3/html5shiv.min.js"></script>
			<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->
		