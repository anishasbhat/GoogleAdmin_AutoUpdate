//function myFunction() {
  /**
 * Generates a user usage report for this day last week as a spreadsheet. The
 * report includes the date, user, last login time, number of emails received,
 * and number of docs owned.
 */
function generateUserUsageReport() {
  var today = new Date();
  var oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  var timezone = Session.getTimeZone();
  var date = Utilities.formatDate(oneWeekAgo, timezone, 'yyyy-MM-dd');

  var parameters = [
    'gmail:num_emails_sent',
    'gmail:num_emails_received',
    'accounts:used_quota_in_mb',
    'accounts:admin_set_name'
  ];
  var rows = [];
  var pageToken;
  var page;
  do {
    page = AdminReports.UserUsageReport.get('all', date, {
      parameters: parameters.join(','),
      maxResults: 500,
      pageToken: pageToken
    });
    var reports = page.usageReports;
    if (reports) {
      for (var i = 0; i < reports.length; i++) {
        var report = reports[i];
        var parameterValues = getParameterValues(report.parameters);
        var row = [
          report.date,
          report.entity.userEmail,
          parameterValues['gmail:num_emails_sent'],
          parameterValues['gmail:num_emails_received'],
          parameterValues['accounts:used_quota_in_mb'],
          parameterValues['accounts:admin_set_name']
        ];
        rows.push(row);
      }
    }
    pageToken = page.nextPageToken;
  } while (pageToken);

  if (rows.length > 0) {

    var spreadsheet = SpreadsheetApp.openById("1iuqjCeLkmfprEHCfYZEnw5v-EbXeDZHqR84AQjCN3Ik");
    var sheet = spreadsheet.getActiveSheet();
    var headers = ['Date', 'User', 'Emails Sent', 'Emails Received',
        'Used Quota', 'Name'];
    // do not need to append headers everytime, already done.

    // Append the results.
    var lastRow = sheet.getLastRow();
    sheet.getRange(1 + lastRow, 1, rows.length, headers.length).setValues(rows);
    Logger.log('Report spreadsheet created: %s', spreadsheet.getUrl());
  } else {
    Logger.log('No results returned.');
  }
}

/**
 * Gets a map of parameter names to values from an array of parameter objects.
 * @param {Array} parameters An array of parameter objects.
 * @return {Object} A map from parameter names to their values.
 */
function getParameterValues(parameters) {
  return parameters.reduce(function(result, parameter) {
    var name = parameter.name;
    var value;
    if (parameter.intValue !== undefined) {
      value = parameter.intValue;
    } else if (parameter.stringValue !== undefined) {
      value = parameter.stringValue;
    } else if (parameter.datetimeValue !== undefined) {
      value = new Date(parameter.datetimeValue);
    } else if (parameter.boolValue !== undefined) {
      value = parameter.boolValue;
    }
    result[name] = value;
    return result;
  }, {});
}
//}
