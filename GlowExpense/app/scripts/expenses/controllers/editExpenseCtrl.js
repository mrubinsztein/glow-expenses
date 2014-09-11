'use strict';

angular.module('Expenses')
    .controller('EditExpenseCtrl', ['$scope', '$location', 'editExpensesTitle', 'editExpensesButtonLabel', 'expenseSharingSvc',
        'cameraSvc', 'reportsRepositorySvc', 'currencySelectDialogSvc', 'expensesRepositorySvc', 'editSaveExpenseDialogSvc',
        'expenseViewImageSvc', 'reportsSharingSvc', 'reportEntityName', 'filterReportByStateSvc',
        'itemsSelectionDialogSvc', 'reportExpensesRepositorySvc', 'localStorageSvc', 'sessionToken', 'reportDetailsPath',
        'expensesPath', 'invoiceImageRepositorySvc', 'errorHandlerDefaultSvc', 'getIdFromLocationSvc', 'expenseSvc',
        'baseUrlMockeyWeb', 'validateNumbersSvc', 'cameraSelectDialog', 'expenseIdShareSvc', 'cameraSelectDialogListenerSvc',
        'expensePostImageSvc',
        function ($scope,  $location, editExpensesTitle, editExpensesButtonLabel, expenseSharingSvc, cameraSvc,
                    reportsRepositorySvc, currencySelectDialogSvc, expensesRepositorySvc, editSaveExpenseDialogSvc,
                    expenseViewImageSvc, reportsSharingSvc, reportEntityName, filterReportByStateSvc,
                    itemsSelectionDialogSvc, reportExpensesRepositorySvc, localStorageSvc, sessionToken, reportDetailsPath,
                    expensesPath, invoiceImageRepositorySvc, errorHandlerDefaultSvc, getIdFromLocationSvc, expenseSvc,
                    baseUrlMockeyWeb, validateNumbersSvc, cameraSelectDialog, expenseIdShareSvc, cameraSelectDialogListenerSvc,
            expensePostImageSvc) {

            $scope.title = editExpensesTitle;
            $scope.buttonLabel = editExpensesButtonLabel;
            $scope.showErrorMessage = false;
            $scope.expenseId = getIdFromLocationSvc.getLastIdFromLocation($location.path());
            $scope.token = localStorageSvc.getItem(sessionToken);
            $scope.path = baseUrlMockeyWeb;

            if (cameraSelectDialogListenerSvc.openCameraSelectDlg){
                cameraSelectDialogListenerSvc.openCameraSelectDlg = false;

                cameraSelectDialog.open().then(function() {
                    cameraSvc.takePhoto().then(function(result){
                        $scope.imageSelectedPath = result;
                    });
                });
            }

            var expenseId = getIdFromLocationSvc.getLastIdFromLocation($location.path());

            $scope.expense = angular.copy(expenseSharingSvc.getExpenseById(expenseId, $scope.reportId));

            var  originalExpense = angular.copy($scope.expense);

            function isInReport(){
                return $location.path().indexOf('report-details') > -1;
            }

            var reportId = 0;
            if (isInReport()){
                reportId = getIdFromLocationSvc.getFirstIdFromLocation($location.path());
            }

            $scope.report = reportsSharingSvc.getReportById(reportId);
            var lastSelectedReport = $scope.report.description;

            $scope.imageSelectedPath = '';


            if($scope.expense.imageType !== 'void')
            {
               invoiceImageRepositorySvc.getImage(
                   { 'token': localStorageSvc.getItem(sessionToken), 'expenseId': expenseId }
               );
               // TODO  ???
               $scope.imageSelectedPath = 'image';
            }

            function addExpenseSuccess(){
                reportsSharingSvc.expenseSharingSvc.addExpense($scope.expense, $scope.report.expenseReportId);
                $location.path(reportDetailsPath + '/' + $scope.report.expenseReportId);
            }

            function updateExpenseSuccess(){
                reportsSharingSvc.expenseSharingSvc.updateExpense($scope.expense, $scope.report.expenseReportId);
                $location.path(reportDetailsPath + '/' + $scope.report.expenseReportId);
            }

            function addExpenseFail(errorResponse){
                errorHandlerDefaultSvc.handleError(errorResponse).then(function(){
                    resetExpense();
                });
            }

            $scope.save = function(form, expense) {
                debugger;
                var reportObj = {
                    'expenseReportId': $scope.report.expenseReportId,
                    'expenseIds': [$scope.expense.expenseId]
                };

                function saveExpenseSuccess(){
                    expenseSharingSvc.updateExpense(expense, reportId);

                    function deleteExpenseSuccess(){
                        reportsSharingSvc.expenseSharingSvc.deleteExpense($scope.expense.expenseId, reportId);
                        reportExpensesRepositorySvc.addExpensesToReport(
                            { 'token': localStorageSvc.getItem(sessionToken) },
                            reportObj,
                            addExpenseSuccess,
                            addExpenseFail
                        );
                    }

                    function deleteExpenseFail(errorResponse){
                        errorHandlerDefaultSvc.handleError(errorResponse).then(function(){
                            resetExpense();
                        });
                    }

                    // expense was just assigned to a report
                    if (!lastSelectedReport && $scope.report.description){
                        reportExpensesRepositorySvc.addExpensesToReport(
                            { 'token': localStorageSvc.getItem(sessionToken) },
                            reportObj,
                            addExpenseSuccess,
                            addExpenseFail
                        );
                    }
                    else {
                        // change assigned expense to another report
                        if (lastSelectedReport !== $scope.report.description){
                            reportExpensesRepositorySvc.deleteExpense(
                                {
                                    'token': localStorageSvc.getItem(sessionToken),
                                    'expenseId': $scope.expense.expenseId
                                },
                                deleteExpenseSuccess,
                                deleteExpenseFail
                            );
                        }
                        // no change in the state of expense
                        else
                        {
                            // it is assigned go to report details
                            if ($scope.report.description){
                                debugger;
                                updateExpenseSuccess();
                            }
                            // it is unassigned go to expenses list
                            else {
                                $location.path(expensesPath);
                            }
                        }
                    }
                }

                function saveExpenseError(errorResponse){
                    errorHandlerDefaultSvc.handleError(errorResponse).then(function(){
                        resetExpense();
                    });
                }

                function postImageSuccess(){
                    expense.date = $scope.expense.date;

                    var newExpense = expenseSvc.create(expense);
                    var paramsObj = { 'token': localStorageSvc.getItem(sessionToken) };

                    expensesRepositorySvc.saveExpense(paramsObj, newExpense, saveExpenseSuccess, saveExpenseError);
                }


                if(form.$valid && validateNumbersSvc.validate(expense))
                {
                    // TODO uncomment when tested with real services with working upload image
//                    var fd = new FormData();
//                    fd.append('file', $scope.imageSelectedPath);
//                    expensePostImageSvc.postImages(
//                        {
//                            'token': localStorageSvc.getItem(sessionToken)
//                        },
//                        $scope.imageSelectedPath,
//                        postImageSuccess,
//                        errorHandlerDefaultSvc.handleError
//                    );

                    // TODO remove when tested with real services with working upload image
                    postImageSuccess();
                }
                else
                {
                    $scope.showErrorMessage = true;
                }
            };

            $scope.selectReport = function(){
                reportsSharingSvc.getReports().then(function(response){
                    $scope.reports = response.filter(filterReportByStateSvc.checkIfInState);
                    itemsSelectionDialogSvc.open($scope.reports, reportEntityName).then(function(selectedReport){
                        if (selectedReport){
                            $scope.report =  selectedReport;
                        }
                    });
                });
            };

            $scope.date = $scope.expense.date;
            $scope.isEdit = true;

            $scope.cancelPhoto = function() {
                $scope.imageSelectedPath = '';
            };

            $scope.takePhoto = function() {
                cameraSelectDialog.open().then(function() {
                    cameraSvc.takePhoto().then(function(result){
                        $scope.imageSelectedPath = result;
                    });
                });
            };

            $scope.viewImage = function(){
                expenseIdShareSvc.setId($scope.expenseId);
                expenseViewImageSvc.open().then(function(){
                    $scope.takePhoto();
                },{});
            };

            function resetExpense(){
               $scope.expense =  angular.copy(originalExpense);
            }
        }
]);