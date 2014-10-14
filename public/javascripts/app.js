var app = angular.module("hotpotatoApp", ["firebase"]);

app.controller("beCtrl", ["$scope", "$firebase",
	function($scope, $firebase) {
		var ref = new Firebase("https://hot-potato.firebaseio.com/");

		// create an AngularFire reference to the data
		var sync = $firebase(ref);

		// download the data into a local object
		$scope.data = sync.$asObject();
	}
]);

app.controller("feCtrl", ["$scope", "$firebase", "$timeout",
	function($scope, $firebase, $timeout) {
		var ref = new Firebase("https://hot-potato.firebaseio.com/users");
		var sync = $firebase(ref);
		$scope.users = sync.$asArray();

		$scope.name = '';
		$scope.msg = '';
		$scope.user = {
			id: '',
			index: ''
		}

		var ref_potato = new Firebase("https://hot-potato.firebaseio.com/potato");
		var sync_potato = $firebase(ref_potato);
		$scope.potato = sync_potato.$asObject();


		ref_potato.on("value", function(snap) {
			$timeout(function() {
				if(typeof snap.val().user_selected != 'undefined' && snap.val().user_selected == $scope.user.id){
					$scope.hot();
				}
			});
		});
		

		$scope.hot = function(){
			$('body').addClass('active');
			$scope.changePanel('play');
		}

		$scope.addPlayer = function(name){
			if($scope.name == ''){
				$scope.msg = 'Please type your name';
			}else{
				$scope.msg = '';
				$scope.showLoader(true);
				var response =  $scope.users.$add({
					'ua': navigator.userAgent,
					'name': $scope.name,
				});
				response.then(function(){
					$scope.user['id'] = response.$$state.value.path.o[1];
					$scope.setUserIndex();
					$scope.changePanel('waiting');
				});	
			}
		}

		$scope.setUserIndex = function(){
			for(var i=0; i<$scope.users.length; i++){
				if($scope.users[i].$id == $scope.user['id']){
					$scope.user['index'] = i;
					break;
				}
			}
		}

		$scope.removeCurrentUser = function(){
			if($scope.user['id'] != ''){
				$scope.users.$remove($scope.user['index']);
			}
		}

		$scope.sendPotato = function(value){
			if( typeof value == 'undefined' ){
				$scope.msg = 'Please select a player';
			}
			else{
				$scope.potato.user_selected = value;
				var response = $scope.potato.$save();
				$scope.showLoader(true);
				response.then(function(){
					$('body').removeClass('active');
					$scope.changePanel('waiting');
					$scope.showLoader(false);
				})
			}
		}

		$scope.changePanel = function(value){
			if( value == 'play' ){
				$('#user_panel, #waiting_panel').hide();
				$('#game_panel').show();
			}
			if( value == 'waiting' ){
				$('#user_panel, #game_panel').hide();
				$('#waiting_panel').show();
				$scope.showLoader(false);
			}
		}

		$scope.showLoader = function(flag){
			if(flag){
				$('#loading').html(ajaxloader);	
			}
			else{
				$('#loading').find('img').remove();
			}	
		}

		$scope.init = function(){
			$('#name').focus();
		}

		$scope.init();
	}
]);

$(window).bind('beforeunload', function(){
	var feCtrl = angular.element($("#user_panel")).scope();
	feCtrl.removeCurrentUser()
	//return 'sure?'
});