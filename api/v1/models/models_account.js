module.exports = models = {
    accountById: {
		name: 'account debt by id',
		required_fields: ['account', 'kod_org'],
        text: `select
		to_char(t.DT, 'DD.MM.YYYY hh:mm:ss.ms') update_date, 
		t.USLUGA as service_id,
		u."name" as service_name,
		--0 as id_counter, -- Если это прибор учета то отображается его номер, если нет счетчика то 0
		--0 as previous_value, -- Если это прибор учета то отображаются предыдущие показания если нет прибора то 0
		--0 as current_vulue, -- Если это прибор учета то отображаются текущие показания если нет прибора то 0
		ls.FIO as account_holder  ,-- Фамилия И.О. абонента зарегистрированного за услугой поставщиком услуг
		t.tarif as service_rate, -- Тариф за оказанную услугу
		t.summa_dolg as  k_oplate, -- Сумма к оплате
		(COALESCE(str.NAME, '') || COALESCE(', д.' || s.home, '')) || CASE WHEN coalesce(s.korp,'') = '' THEN '' ELSE '/'||s.korp end || coalesce(' кв. '||s.kv, '') AS address,
    	--str.name as street,-- Адрес абонента зарегистрированного за услугой										 
		--s.home,
		--s.korp,
		--s.kv,
		s.ls as  main_account, -- Единый номер лицевого счета
		ls.ls as account, -- лицевой счет поставщика услуг.
		o.id as provider_id ,-- код поставщика услуг согласно справочника организаций (ORGANIZATION)*
		o."name" as provider_name, -- Наименование организации поставщика услуг
		o.mfo  as provider_mfo, -- МФО поставщика услуг
		o.kod_okpo  as provider_okpo,-- ОКПО поставщика услуг
		o.bank provider_bank_name, -- Наименование банка поставщика услуг.
		'' provider_bank_account
		from public.sheta as s 
		join public.ls_shet as ls on ls.ls = s.ls
		join public.organization as o on o.id = ls.kod_org
		join public.tsa as t on t.ls = ls.ls and t.usluga = ls.usluga 
		left join public.street as str on str.np = s.street_nom 
		left join public.viduslugi as u on u.id = t.usluga
		
		where s.ls = $1`
    },
    accountByProvider: {
        name: 'account debt by id and by provider id',
		text: `select
		to_char(t.DT, 'DD.MM.YYYY hh:mm:ss.ms') update_date, 
		t.USLUGA as service_id,
		'тепло' as service_name,
		0 as id_counter, -- Если это прибор учета то отображается его номер, если нет счетчика то 0
		0 as previous_value, -- Если это прибор учета то отображаются предыдущие показания если нет прибора то 0
		0 as current_vulue, -- Если это прибор учета то отображаются текущие показания если нет прибора то 0
		ls.FIO as account_holder  ,-- Фамилия И.О. абонента зарегистрированного за услугой поставщиком услуг
		0 as service_rate, -- Тариф за оказанную услугу
		t.summa_dolg as  debt_amount, -- Сумма к оплате
		'' as holder_address, -- Адрес абонента зарегистрированного за услугой
		s.ls as  main_account, -- Единый номер лицевого счета
		ls.ls as account, -- лицевой счет поставщика услуг.
		jsonb_build_object('provider_id',o.id  ,-- код поставщика услуг согласно справочника организаций (ORGANIZATION)*
		'provider_name',o."name", -- Наименование организации поставщика услуг
		'provider_mfo',o.mfo, -- МФО поставщика услуг
		'provider_okpo',o.kod_okpo  ,-- ОКПО поставщика услуг
		'provider_bank_name',o.bank , -- Наименование банка поставщика услуг.
		'provider_bank_account', null) as provider_data
		from public.sheta as s 
		join public.ls_shet as ls on ls.ls = s.ls
		join public.organization as o on o.id = ls.kod_org and o.id = $2
		join public.tsa as t on t.ls = ls.ls and t.usluga = ls.usluga and t.kod_poluch = o.id
		where s.ls = $1`
	},
	//Получение единого лицевого счета из общей базы UID
	accountGetUID: {
		name:'account get UID',
		required_fields: ['account', 'kod_org'],
		text: `select ls.ls, ls.kod_org, ls.name ls_org from ls_shet ls where ls.name = $1 and ls.kod_org= $2`
	}
	
}