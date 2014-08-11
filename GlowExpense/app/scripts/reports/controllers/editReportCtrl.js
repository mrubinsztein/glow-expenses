'use strict';
/*global alert */

angular.module('Reports')
    .controller('EditReportCtrl', ['$scope', '$filter', '$location', 'addReportErrorMsg', 'reportsSharingSvc', 'projectRepositorySvc', '$modal', 'reportsRepositorySvc',
        function ($scope, $filter, $location, addReportErrorMsg,reportsSharingSvc,projectRepositorySvc, $modal, reportsRepositorySvc)  {
            $scope.errorMessage = addReportErrorMsg;
            $scope.showErrorMessage = false;
            $scope.projects = null;

            $scope.reportData = {};

            //debugger;
            function onSuccess(projects) {
                $scope.projects = projects;
            }

            function onFail(message) {
                alert('Failed because: ' + message);
            }

            function onSuccessSave() {
                $location.path('/view-report');
            }

            function onFailSave(message) {
                alert('Failed because: ' + message);
            }
            
            $scope.projectNameModal = function() {
                //debugger;
                var modalInstance = $modal.open({
                    templateUrl: 'projectNameModal',
                    controller: 'projectNameModalCtrl',
                    size: 'sm',
                    resolve: {
                    data: function () {
                      return {'projects': $scope.projects,'target':event.target};
                    }
                  }
                });
                modalInstance.result.then(function () {
                   //onclose
                }, function () {
                });
            };

            projectRepositorySvc.getProjects( onSuccess,onFail );

            $scope.report = reportsSharingSvc.getReport().data;
          //debugger;           
          //TODO: SEND THE FORM NOW IT DOESNT SEND ANYTHING
          $scope.save = function(form){
            $scope.reportData.token = localStorage.getItem('session-token');
            //dont know from where to get it. Ask geronimo
            $scope.reportData.expense = undefined;
            $scope.reportData.expenseID = undefined;

            $scope.reportData.description = form.title;

            // TODO: GET THE DATA-ID,DATA-NAME FROM THE PROJECT INPUT
            reportsRepositorySvc.editReports($scope.reportData,onSuccessSave,onFailSave);
          };

        }
    ]);