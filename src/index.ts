import joplin from 'api';
import {SettingItemSubType, SettingItemType, ToolbarButtonLocation} from "../api/types";

const fs = joplin.require('fs-extra');


joplin.plugins.register({

	onStart: async function () {


		await joplin.commands.register({
			name: 'exportAsMd',
			label: 'Export as MD',
			iconName: 'fas fa-file-export',
			execute: async () => {
				console.info('exportAsMd');
				const note = await joplin.workspace.selectedNote();
				if (note) {
					const fileExportPath = await joplin.settings.value('fileExportPath');
					const content = note.body;

					const fullPath = `${fileExportPath}/${note.title}.md`;

					await fs.outputFile(fullPath, content);

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
		});


	},

});