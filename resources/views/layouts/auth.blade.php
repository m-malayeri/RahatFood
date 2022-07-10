<!DOCTYPE html>
<html lang="fa" dir="rtl">
	<head>
		@include('includes.head')
		@yield('seo')
	</head>
	<body style="background-color:#f2f2f2;">
		@include('includes.nav')
		<section class="auth-section">
			<div class="container">
				<div class="row">
					<div class="col-md-6 col-md-offset-3 col-sm-10 col-sm-offset-1 col-xs-12">
						<div class="auth-container">
							<center>
								@yield('content')
							</center>						
						</div>
					</div>
				</div>
			</div>
		</section>
		<footer class="internal-footer-section"  style="background-color:#fff;">
			<div class="container">
				<div class="row">
					<div class="col-md-2 col-sm-2 text-center"><a href="{{url('info#about')}}" target="_blank">درباره ما</a></div>
					<div class="col-md-2 col-sm-2 text-center"><a href="{{url('info#contact')}}" target="_blank">ارتباط با ما</a></div>
					<div class="col-md-2 col-sm-2 text-center"><a href="{{url('info#faq')}}" target="_blank">سوالات متداول</a></div>
					<div class="col-md-2 col-sm-2 text-center"><a href="{{url('info#terms')}}" target="_blank">قوانین و مقررات</a></div>
					<div class="col-md-2 col-sm-2 text-center"><a href="{{url('info#privacy')}}" target="_blank">حریم خصوصی</a></div>
					<div class="col-md-2 col-sm-2 text-center"><a href="{{url('info#careers')}}" target="_blank">فرصتهای شغلی</a></div>
				</div>
			</div>
		</footer>
	</body>
</html>