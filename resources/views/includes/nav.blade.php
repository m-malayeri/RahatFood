<nav class="navbar navbar-default navbar-fixed-top">
	<div class="container">
		<div class="navbar-header">
			<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
				<span class="sr-only">Toggle navigation</span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
				<span class="icon-bar"></span>
			</button>
			<a class="navbar-brand" href="{{url('/home')}}"><img src="{{ URL::asset('images/navlogo.png') }}" width="35" height="35" alt="راحت فود" title="خانه"></a>
		</div>
		<div id="navbar" class="navbar-collapse collapse">
			<ul class="nav navbar-nav"> 
				@if(Auth::check())
					<li><div class="hidden-xs" style="color:#fff3f1;padding-top:12px;">{{Auth::user()->name}}، خوش آمدید!</div></li>
					@if (Auth::user()->isAdmin())
						<li><a href="{{url('/admin/orders')}}">پنل مدیریت</a></li>
					@elseif(Auth::user()->isVendor())
						<li><a href="{{url('/vendor/orders')}}">پنل رستوران</a></li>
					@else
						<li><a href="{{url('/panel')}}">پنل کاربری</a></li>
					@endif
					<li><a href="{{url('/logout')}}"> خروج</a></li>
				@else
					<li><a href="{{url('/login')}}">ورود</a></li>
					<li><a href="{{url('/register')}}">ثبت نام</a></li>
				@endif
			</ul>
			
			
		</div>
	</div>
</nav>