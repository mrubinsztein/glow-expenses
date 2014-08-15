'use strict';

angular.module('Expenses')
    .controller('ExpensesListCtrl', ['$scope', '$location', 'cameraSvc', 'expensesBufferingSvc', 'expenseSvc',
        'editExpenseSvc', 'editModeNotificationChannelSvc', 'reportsSharingSvc',
        function ($scope, $location, cameraSvc, expensesBufferingSvc, expenseSvc, editExpenseSvc,
                  editModeNotificationChannelSvc, reportsSharingSvc)  {


        $scope.expenses = [];
        $scope.isEditMode = false;

        function toggleEditModeHandler(isEditMode){
            $scope.isEditMode = isEditMode;
        }

        editModeNotificationChannelSvc.onEditModeToggled($scope, toggleEditModeHandler);

        // TODO remove this when real services are implemented
        var firstLoad = true;

        $scope.getMoreExpenses = function () {

            // TODO remove this when real services are implemented
            if (firstLoad) {
                firstLoad = false;
                return;
            }

            expensesBufferingSvc.getMoreExpenses().then(function (result) {
                result.forEach(function (item) {
                    $scope.expenses.push(expenseSvc.getExpense(item));
                });
            });
        };

        $scope.goToReports =  function(){
            $location.path('/reports');
        };

        expensesBufferingSvc.getExpenses().then(function (result) {
            result.forEach(function (item) {
                $scope.expenses.push(item);
            });
        });

        $scope.takePhoto = function(expense) {
            if(!$scope.isEditMode){
                cameraSvc.takePhoto().then(function(){
                    // TODO get the type from the image or make constants with the types
                    expense.imageType = 'jpg';
                });
            }
        };

        $scope.editExpense = function(expense) {
            if(!$scope.isEditMode)
            {
                editExpenseSvc.setExpenseForEdit(expense);
                reportsSharingSvc.setReport();
                $location.path('/edit-expense');
            }
        };
    }
]);