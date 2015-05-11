angular.module('getcloudify').directive('cfyVersions', function( $http, $log ){

    return {
        restrict: 'A',
        scope:{},
        template: '<select ng-model="showVersion" ng-change="redirectToVersion(showVersion)" ng-options="v.name for v in versions"></select>',
        link: function( $scope/*, element*/ ){
            var currentVersion = document.location.pathname.split('/')[1];
            $log.info('loading versions');
            $http.get('/versions.json').then(function(result){
                $scope.versions = result.data;
                _.each(result.data, function( item ){
                    if ( item.name === currentVersion ){
                        $scope.showVersion = item;
                    }
                })
            });

            $scope.redirectToVersion = function( version ){
                $log.info(version);
                document.location = document.location.origin + '/' + version;
            }
        }
    }
});
