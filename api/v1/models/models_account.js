module.exports = models = {
    accountById: {
		name: 'account debt by id',
		required_fields: ['account'],
        text: `select
		to_char(t.DT, 'DD.MM.YYYY hh:mm:ss.ms') update_date, 
		t.USLUGA as service_id,
		t.id_period,
		u."name" as service_name,
		--0 as id_counter, -- Если это прибор учета то отображается его номер, если нет счетчика то 0
		--0 as previous_value, -- Если это прибор учета то отображаются предыдущие показания если нет прибора то 0
		--0 as current_vulue, -- Если это прибор учета то отображаются текущие показания если нет прибора то 0
		ls.FIO as account_holder  ,-- Фамилия И.О. абонента зарегистрированного за услугой поставщиком услуг
		t.tarif as tarif, -- Тариф за оказанную услугу
		t.summa_dolg as  k_oplate, -- Сумма к оплате
		(COALESCE(str.NAME, '') || COALESCE(', д.' || s.home, '')) || CASE WHEN coalesce(s.korp,'') = '' THEN '' ELSE '/'||s.korp end || coalesce(' кв. '||s.kv, '') AS address,
    	--str.name as street,-- Адрес абонента зарегистрированного за услугой										 
		--s.home,
		--s.korp,
		--s.kv,
		s.ls as  uid, -- Единый номер лицевого счета
		ls.name as account, -- лицевой счет поставщика услуг.
		o.id as provider_id ,-- код поставщика услуг согласно справочника организаций (ORGANIZATION)*
		o."name" as provider_name -- Наименование организации поставщика услуг
		--o.mfo  as provider_mfo, -- МФО поставщика услуг
		--o.kod_okpo  as provider_okpo,-- ОКПО поставщика услуг
		--o.bank provider_bank_name, -- Наименование банка поставщика услуг.
		--'' provider_bank_account
		from public.sheta as s 
		join public.ls_shet as ls on ls.ls = s.ls
		join public.organization as o on o.id = ls.kod_org
		join public.tsa as t on t.ls = ls.ls and t.usluga = ls.usluga 
		left join public.street as str on str.np = s.street_nom 
		left join public.viduslugi as u on u.id = t.usluga
		
		where s.ls = $1 and t.id_period=(select id from period p where p."current"=true)`
	},
	
	accountCurrPeriod: {
		name: 'period get current',
		required_fields: [],
		text: 'select id from period p where p."current"=true'

	},

	accountGetTsaCount:{
		name: 'tsa get period_id',
		required_fields: ['ls_poluch', 'id_period, kod_poluch'],
		text: 'select count(t.np) from tsa t where t.ls_poluch=$1 and t.id_period=$2 and kod_poluch=$3'
	},

	accountTsaUpdate:{
		name: 'tsa update',
		text: 'UPDATE public.tsa SET kp=$1, koplate=$2, nachisl=$3, norm=$4, proc_lgo=$5, procent_lg=$6, summa_dolg=$7, '+
					'tarif=$8, usluga=$9, a_close=$10, a_dem=$11, sum_trf_ht=$12, sum_topay_ht=$13, saldon=$14, sum_topay_fw=$15, '+ 
					'sum_pay_bank=$16, sum_pay_mpom=$17, sum_pay_comp=$18, saldok=$19'+
				'where ls=$20 and id_period=$21'
	},
	accountTsaInsert:{
		name: 'tsa insert',
		required_fields: ['ls', 'dt', 'ls_poluch', 'kp', 'kod_poluch', 'usluga', 'summa_dolg', 'nachisl', 'tarif', 'subsid', 'id_period'],
		text: 'INSERT INTO TSA (ls, dt,ls_poluch, kp, kod_poluch, usluga, summa_dolg, nachisl, tarif, subsid, id_period, '+
					'A_CLOSE, A_DEM, SUM_TRF_HT, SUM_TOPAY_HT, SALDON, SUM_TOPAY_FW, SUM_PAY_BANK, SUM_PAY_MPOM, SUM_PAY_COMP, SALDOK'+
				') VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, '+
				'$12, $13, $14, $15, $16, $17, $18, $19, $20, $21'+
			')'
	},

	accountShetaUpdate:{
		required_fields: ['fio','k_lgot', 'kp', 'kp_jek', 'pl_o', 'ls'],
		name: 'sheta update',
		text: 'UPDATE sheta SET fio=$1, k_lgot=$2, kp=$3, kp_jek=$4, pl_o=$5 where ls=$6'
	},

	//Получение единого лицевого счета из общей базы UID
	accountGetUID: {
		name:'account get UID',
		required_fields: ['account', 'kod_org'],
		text: `select ls.ls, ls.kod_org, ls.name ls_org from ls_shet ls where ls.name = $1 and ls.kod_org= $2`
	}
	
}