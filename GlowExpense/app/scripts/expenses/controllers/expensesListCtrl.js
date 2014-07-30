'use strict';

angular.module('Expenses')
    .controller('ExpensesListCtrl', ['$scope', '$filter', '$location', 'expenseSvc', 'expensesRepositorySvc', 'expensesBufferingSvc',
        'defaultMode', 'selectMode', 'editExpenseSvc', 'cameraSvc', '$modal',
        function ($scope, $filter, $location, expenseSvc, expensesRepositorySvc, expensesBufferingSvc, defaultMode, selectMode, editExpenseSvc,
                  cameraSvc, $modal)  {


             //   var currencies = currenciesSvc.get();

                var mode = defaultMode;

                // TODO remove this when real services are implemented
                var firstLoad = true;
                $scope.isMain = true;
                $scope.expenses = [];

                $scope.searchedExpense = {};

                $scope.showSorting = false;
                $scope.reverseSorting = true;

                $scope.showSearch = false;

                $scope.showDeleteMode = false;

                $scope.showEditMode = false;

                $scope.expenseForDeletion = null;

                //when edit list is active
                $scope.$on('EditList', function(event, args) {
                    $scope.showEditMode = args;
                });

                $scope.$on('DeleteExpense', function(event, args) {
                    debugger;
                    expensesRepositorySvc.deleteExpense({"token":localStorage.getItem("session-token"),"expenseId":expenseId}, onSuccess, onFail);
                });

                $scope.deleteExpense = function(expenseId) {
                    
                    function onSuccess() {
                        $scope.expenses.splice(expenseId,1);
                        alert("Succesfully deleted the expense");
                    }

                    function onFail() {
                        alert("Could not connect");
                    }

                    $scope.expenseForDeletion = expenseId;

                    var modalInstance = $modal.open({
                        templateUrl: 'deleteModal',
                        controller: DeleteExpModalCtrl,
                        size: "sm",
                        resolve: {
                        items: function () {
                          return expenseId;
                        }
                      }
                    });                
                };

                $scope.takePhoto = function() {
                    function onSuccess(imageURI) {
                        $scope.imageSelectedPath = imageURI;
                    }

                    function onFail(message) {
                        alert('Failed because: ' + message);
                    }

                    //main function for photo
                    navigator.camera.getPicture(onSuccess, onFail,
                        {
                            quality: 50,
                            destinationType: Camera.DestinationType.FILE_URI,
                            targetWidth: 50,
                            targetHeight: 50
                        }
                    );
                };

                $scope.showInvoiceImage = function() {
                    $location.path('/invoice-expense-image');
                };

                $scope.editExpense = function(expense) {
                    editExpenseSvc.setExpenseForEdit(expense);
                    $location.path('/edit-expense');
                };

                $scope.selectMode = function () {
                    return mode === selectMode;
                };

                $scope.select = function () {

                };

                $scope.getMoreExpenses = function () {

                    // TODO remove this when real services are implemented
                    if (firstLoad) {
                        firstLoad = false;
                        return;
                    }

                    expensesBufferingSvc.getMoreExpenses($scope).then(function (result) {
                        result.forEach(function (item) {
                            $scope.expenses.push(expenseSvc.getExpense($scope, item));
                        });

                    });
                };

                $scope.enableSorting = function () {
                    $scope.showSorting = true;
                };

                $scope.sort = function (reverseSorting) {
                    $scope.reverseSorting = reverseSorting;
                    order('date', reverseSorting);
                    $scope.showSorting = false;
                };

                $scope.toggleSearching = function (showSearch) {
                    $scope.showSearch = showSearch;
                };

                $scope.takePhoto = function(expense) {
                    cameraSvc.takePhoto().then(function(){
                        // TODO get the type from the image or make constants with the types
                        expense.imageType = 'jpg';
                    });
                };

                var orderBy = $filter('orderBy');

                function order(predicate, reverse) {
                    $scope.expenses = orderBy($scope.expenses, predicate, reverse);
                }

                expensesBufferingSvc.getExpenses($scope).then(function (result) {
                    result.forEach(function (item) {
                        $scope.expenses.push(item);
                    });
                });

            }
    ]);