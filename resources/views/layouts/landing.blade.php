<!DOCTYPE html>
<html lang="fa" dir="rtl">
	<head>
		@include('includes.head')
		@yield('seo')
	</head>
	<body>
		@include('includes.nav')
		@yield('content')
		<footer class="footer-section">
			<div class="container">
				<div class="row">
					<div class="col-md-12">
						<div class="text-center">
							<div class="links"> 
								<a href="{{url('/info#about')}}" target="_blank">درباره ما</a>  |  
								<a href="{{url('/info#contact')}}" target="_blank">ارتباط با ما</a>  |  
								<a href="{{url('/info#faq')}}" target="_blank">سوالات متداول</a>  |
								<a href="{{url('/info#terms')}}" target="_blank">قوانین و مقررات</a>  |
								<a href="{{url('/info#privacy')}}" target="_blank">حریم خصوصی</a>  |
								<a href="{{url('/info#careers')}}" target="_blank">فرصتهای شغلی</a>
							</div>
							<div class="footer-text">کلیه حقوق محفوظ است - راحت فود {{number2farsi2(1396)}}</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	</body>
</html>	
					
