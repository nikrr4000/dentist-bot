import { InlineKeyboard } from "grammy";

const menuDenyConfirmK = (short = false) => {
	const k = new InlineKeyboard();
	if (!short)
	{
		k.text("Отменить", "deny");
	}
	return k
		.text("Подтвердить", "confirm")
		.row()
		.text("Главное меню", "main_menu");
};

function greetingKeyboard() {
	const keyboard = new InlineKeyboard()
		.url("Моя группа", "https://t.me/zubsilaevoi")
		.row()
		.text("Доступные записи", "gen_appt-check_user")
		.row()
		.text('Ваши записи', "gen_records-check_user");
	return keyboard;
}


const adminMenuKeyboard = () => {
	const k = new InlineKeyboard();
	k.text("Создать встречу", "appt_create_admin")
		.row()
		.text('Открытые записи', "gen_appt-check_admin");;

	return k;
};

const adminMenu = {
	back: new InlineKeyboard().text('Назад', 'gen_admin-menu'),
	menu: new InlineKeyboard().text('Главное меню', 'gen_admin-menu'),
}

const mainMenu = {
	back: new InlineKeyboard().text('Назад', 'gen_main-menu'),
	menu: new InlineKeyboard().text('Главное меню', 'gen_main-menu'),
}
const backButton = new InlineKeyboard().text("Назад", "back");

export {
	greetingKeyboard,
	mainMenu,
	adminMenuKeyboard,
	adminMenu,
	backButton,
	menuDenyConfirmK,
};
