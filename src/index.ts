import joplin from 'api';
import {SettingItemSubType, SettingItemType, ToolbarButtonLocation} from "../api/types";

const fs = joplin.require('fs-extra');


joplin.plugins.register({

	onStart: async function () {

		const dialogs = joplin.views.dialogs;


		const handle = await dialogs.create('exportpath');
		await dialogs.setHtml(handle,
		'<p style="text-align: center">' +
				'Set your output folder in Settings -> File Export Settings to export your file.' +
			'</p>'
		);
		await dialogs.setButtons(handle, [
			{
				id: 'ok',
			}
		]);


		const successmessage = await dialogs.create('successmessage');


		await joplin.commands.register({
			name: 'exportAsMd',
			label: 'Export as MD',
			iconName: 'fas fa-file-export',
			execute: async () => {
				const note = await joplin.workspace.selectedNote();
				if (note) {
					const fileExportPath = await joplin.settings.value('fileExportPath');
					if(fileExportPath === ''){
						console.info('No export path is set');

						await dialogs.open(handle);

						return;
					}
					const content = note.body;

					const fullPath = `${fileExportPath}/${note.title}.md`;

					await fs.outputFile(fullPath, content).then(() => {
						console.info('File exported');

						//if showExportConfirmationPopup is true, show popup
						joplin.settings.value('showExportConfirmationPopup').then((value) => {

							if (value) {
								dialogs.setHtml(successmessage,
									'<p style="text-align: center">' +
									'File exported to ' + fullPath +
									'</p>'
								).then(() => {
									dialogs.setButtons(successmessage, [
										{
											id: 'ok',
										}
									])
								}).then(() => {
									dialogs.open(successmessage);
								});

							}
						});
					});
				} else {
					console.info('No note is selected');
				}
			},
		});
		await joplin.views.toolbarButtons.create('exportAsMd', 'exportAsMd', ToolbarButtonLocation.EditorToolbar);



		const installDir = await joplin.plugins.installationDir();
		const chromeCssFilePath = installDir + '/style.css';
		await (joplin as any).window.loadChromeCssFile(chromeCssFilePath);


		await joplin.settings.registerSection('fileExportSettings', {
			label: 'File Export Settings',
			iconName: 'fas fa-file-export',

		});

		await joplin.settings.registerSettings({

			'fileExportPath': {
				value: '',
				type: SettingItemType.String,
				subType: SettingItemSubType.DirectoryPath,
				section: 'fileExportSettings',
				public: true,
				label: 'Export folder path',
			},
			// add checkbox setting labeled "show export confirmation popup"
			'showExportConfirmationPopup': {
				value: false,
				type: SettingItemType.Bool,
				section: 'fileExportSettings',
				public: true,
				label: 'Show export confirmation popup',
			}
		});


	},

});
