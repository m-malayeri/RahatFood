<!DOCTYPE html>
<html lang="fa" style="padding-top:0px;" dir="rtl">
	<head>
		@include('includes.dash-head')
	</head>
	<body>
		<div class="container-fluid">
			<div class="row">
				<div class="col-md-2 my-side">	
					<!-- menu profile quick info -->
					<div class="clearfix">
						<h4>مدیر محترم رستوران</h4>
						<h6>خوش آمدید</h6>
					</div>	
					<br/>
						
					<!-- sidebar menu -->
					<div class="menu_section">
						<ul class="side-menu">
							<li><a href="{{url('vendor/orders')}}"><i class="icon-shopping-cart"></i>  سفارشها</a></li>
							<li><a href="{{url('vendor/products')}}"><i class="icon-list"></i>  منوی واحد</a></li>
							<li><a href="{{url('vendor/track')}}"><i class="icon-search"></i>  پیگیری سفارش</a></li>
							<li><a href="{{url('vendor/edit')}}"><i class="icon-edit"></i>  ویرایش اطلاعات</a></li>
							<li><a href="{{url('/logout')}}"><i class="icon-off"></i>  خروج</a></li>
						</ul>
					</div>
				</div>
				<!-- page content -->
				<div class="col-md-10" role="main">
					@yield('content')
				</div>
			</div>
		</div>
	</body>
</html>