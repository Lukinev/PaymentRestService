module.exports = models = {
    accountById: {
		name: 'account debt by id',
		required_fields: ['account'],
        text: `select
		--to_char(t.DT, 'DD.MM.YYYY hh:mm:ss.ms') update_date, 
		t.USLUGA as service_id,
		t.id_period,
		s.pl_o as SQ, 
		u."name" as service_name,
		t.saldon as saldon, -- Сумма к оплате
		--0 as id_counter, -- Если это прибор учета то отображается его номер, если нет счетчика то 0
		--0 as previous_value, -- Если это прибор учета то отображаются предыдущие показания если нет прибора то 0
		--0 as current_vulue, -- Если это прибор учета то отображаются текущие показания если нет прибора то 0
		ls.FIO as fio  ,-- Фамилия И.О. абонента зарегистрированного за услугой поставщиком услуг
		t.sum_trf_ht as tarif, -- Тариф за оказанную услугу
		t.saldon as saldon, -- Долг наначало периода
		t.sum_topay as SUM_TOPAY, --Начисленно
		t.saldok as saldok, -- Сумма к оплате
		(COALESCE(str.NAME, '') || COALESCE(', д.' || s.home, '')) || CASE WHEN coalesce(s.korp,'') = '' THEN '' ELSE '/'||s.korp end || coalesce(' кв. '||s.kv, '') AS address,
		s.ls as  uid, -- Единый номер лицевого счета
		ls.name as account, -- лицевой счет поставщика услуг.
		o.id as provider_id,-- код поставщика услуг согласно справочника организаций (ORGANIZATION)*
		o."name" as provider_name, -- Наименование организации поставщика услуг
		o.mfo  as provider_mfo, -- МФО поставщика услуг
		o.kod_okpo  as provider_okpo,-- ОКПО поставщика услуг
		b.name_print provider_bank_name, -- Наименование банка поставщика услуг.
		o.ns provider_bank_account
		
		from public.sheta as s 
			join public.ls_shet as ls on ls.ls = s.ls
			join public.organization as o on o.id = ls.kod_org
			join public.tsa as t on t.ls = ls.ls and t.usluga = ls.usluga 
			left join public.street as str on str.np = s.street_nom 
			left join public.viduslugi as u on u.id = t.usluga
			left join public.bank as b on b.id = o.bank
			--left join public.fio as f on (f.uid = s.ls and f.period_id=(select max(id) from period p where p.id<=t.id_period))
		
		--where s.ls = $1 and t.id_period=(select id from period p where p."current"=true)
		where s.ls = $1 and 
		(
		t.id_period=(select id from period p where p."current"=true)
		or 
		t.id_period=(select max(t.id_period) from tsa t where ls=$1)
		)
		`
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
					'tarif=$8, usluga=$9, sum_trf_ht=$10, sum_topay_ht=$11, saldon=$12, sum_topay_fw=$13, '+ 
					'sum_pay_bank=$14, sum_pay_mpom=$15, sum_pay_comp=$16, saldok=$17'+
				'where ls=$18 and id_period=$19'
	},
	accountTsaInsert:{
		name: 'tsa insert',
		text: 'INSERT INTO TSA (ls, dt,ls_poluch, kp, kod_poluch, usluga, summa_dolg, nachisl, tarif, subsid, id_period, '+
					' SUM_TRF_HT, SUM_TOPAY_HT, SALDON, SUM_TOPAY_FW, SUM_PAY_BANK, SUM_PAY_MPOM, SUM_PAY_COMP, SALDOK'+
				') VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, '+
				'$12, $13, $14, $15, $16, $17, $18, $19'+
			')'
	},

	accountShetaUpdate:{
		name: 'sheta update',
		text: 'UPDATE sheta SET k_lgot=$2, kp=$3, kp_jek=$4, pl_o=$5, a_close=$6, a_dem=$7 where ls=$8'
	},

	//Получение единого лицевого счета из общей базы UID по организации
	accountGetUID_ORG: {
		name:'account get UID for provider_id',
		required_fields: ['account', 'provider_id'],
		text: `select ls.ls uid, ls.kod_org, ls.name ls_org from ls_shet ls where ls.name = $1 and ls.kod_org= $2`
	},

	//Получение единого лицевого счета из общей базы UID по организации
	accountGetUID: {
		name:'account get UID',
		required_fields: ['account'],
		text: `select ls.ls uid, ls.kod_org, ls.name ls_org from ls_shet ls where ls.name = $1`
		// and ls.kod_org = $2
	},

	//Количество записей бланков по л/с
	accountBlank2016Count: {
			name:'blank2016 get count',
			text: 'select count(ls) from blank2016 b where b.ls = $1; '
	},

	accountBlank2016Insert:{
		name: 'blank2016 insert',
		text: `INSERT INTO public.blank2016
		(ls, sq, addr_id, sq_dom, pers, a_state, a_act_hw, a_act_ht, a_metr_hw, a_metr_ht, a_metr_house_hw, a_metr_house_ht, date_check_hw, date_check_ht, data_metr_hw, data_norm_hw, gkal_1_2, gkal_3_4, gkal_5, gkal_dom, gkalm_dom, dt_hw_dom, sum_ht_dom, sum_hw_dom)
		VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24);`
	},

	//Получение данных бланка по UID
	accountBlank2016Get: {
		name:'blank2016 get UID',
		text: `select 
				b.ADDR_ID,
				l."name" as civ_code, 
				f.fio civ_name,
				(COALESCE(str.NAME, '') || COALESCE(', д.' || s.home, '')) || CASE WHEN coalesce(s.korp,'') = '' THEN '' ELSE '/'||s.korp end || coalesce(' кв. '||s.kv, '') AS address,
		 		b.sq,
		 		b.sq_dom,
		 		b.pers,
		 		b.A_STATE,
		 		b.A_ACT_HW,
		 		b.A_ACT_HT,
		 		b.A_METR_HW,
		 		b.A_METR_HT,
		 		b.A_METR_HOUSE_HW,
		 		b.A_METR_HOUSE_HT,
		 		b.DATE_CHECK_HW,
		 		b.DATE_CHECK_HT,
		 		b.DATA_METR_HW,
		 		b.DATA_NORM_HW,
		 		b.GKAL_1_2,
		 		b.GKAL_3_4,
		 		b.GKAL_5,
		 		b.GKAL_DOM,
		 		b.GKALM_DOM,
		 		b.DT_HW_DOM,
		 		b.SUM_HT_DOM,
		 		b.SUM_HW_DOM
  			from blank2016 b
	  			left join sheta as s on s.ls = b.ls
	  			left join ls_shet as l  on (l.ls=b.ls and l.kod_org=$2) 
				  left join public.street as str on str.np = s.street_nom 
				  left join public.fio as f on (f.uid = s.ls and f.period_id<=(select max(id) from period p where p."current"=true))
  			where b.ls=$1`
	},

	accountGetCalc:{
		name: 'get calc',
		text: `select 
				p."Name" PERIOD_NAME,
				t.id_period PERIOD_ID,
				l."name" CIV_CODE,
				t.dt REG_DATE,
				l.fio CIV_NAME,
				(COALESCE(str.NAME, '') || COALESCE(', д.' || s.home, '')) || CASE WHEN coalesce(s.korp,'') = '' THEN '' ELSE '/'||s.korp end || coalesce(' кв. '||s.kv, '') AS address,
				v."name" SERV_NAME,
				s.kp PERS,
				s.pl_o SQ,
				s.a_close A_CLOSE,
				s.a_dem A_DEM,
				t.sum_trf_ht SUM_TRF_HT,
				t.sum_topay_ht SUM_TOPAY_HT,
				t.sum_trf_fw SUM_TRF_FW,
				t.sum_topay_fw SUM_TOPAY_FW,
				t.saldon SALDON,
				t.sum_topay SUM_TOPAY,
				t.sum_pay_bank SUM_PAY_BANK,
				t.subsid SUM_PAY_SUBS,
				t.sum_pay_mpom SUM_PAY_MPOM,
				t.sum_pay_comp SUM_PAY_COMP,
				t.saldok SALDOK
        		/*
                "A_ACT_HW": 0,
                "A_METR_HW": 0,
                "A_ACT_HT": 1,
                "A_METR_HT": 0,
                "METER_ID": 10153,
                "PRIV_CNT": 0,
                "A_PRIV": 0,
                "A_INDB": 0*/
			from tsa t
				left join ls_shet as l on (l.ls=t.ls)
				left join viduslugi as v on t.usluga=v.id
				left join sheta as s on s.ls=t.ls
				left join street as str on str.np = s.street_nom 
				left join period as p on p.id = t.id_period
			where 
				  t.ls=$1
				  and
				  t.id_period<=(select id from period where period."current"=true)
			order by t.id_period desc`
	},

	accountFindAddress:{
		name: 'sheta find address',
		text: `select 
		s.ls UID,
		l."name" CIV_CODE,
		l.fio CIV_NAME,
		(COALESCE(str.NAME, '') || COALESCE(', д.' || s.home, '')) || CASE WHEN coalesce(s.korp,'') = '' THEN '' ELSE '/'||s.korp end || coalesce(' кв. '||s.kv, '') AS address,
		s.kp PERS,
		s.pl_o SQ
			from sheta s
				left join ls_shet as l on (l.ls=s.ls and l.kod_org=$4)
				left join street as str on str.np = s.street_nom 
			where 
  				(str."name" like $1 or str.name_u like $1)
  				and
  				s.home like $2
				and  
  				s.kv like $3
  				and
				  s.a_close = 0	
				and
				  s.kp>0
		
		 order by s.home, s.korp, s.kv
		 limit 15
		 `
	}, 

	accountFinfFIO:{
		name: 'sheta find FIO',
		text: `select * from (select 
			s.ls uid,
			l."name" CIV_CODE,
			l.fio FIO,
			(COALESCE(str.NAME, '') || COALESCE(', д.' || s.home, '')) || CASE WHEN coalesce(s.korp,'') = '' THEN '' ELSE '/'||s.korp end || coalesce(' кв. '||s.kv, '') AS address,
			--s.kp PERS,
			--s.pl_o SQ,
			--t.id_period,'
			t.saldok as saldok
				from sheta s
					left join ls_shet as l on (l.ls=s.ls and l.kod_org=$2)
					left join street as str on str.np = s.street_nom 
					left join tsa as t on (t.ls = s.ls and t.id_period=(select p.id from period p where p."current"=true))
					where 
					s.a_close=0
					and
					s.kp>0
				  
			  order by fio, s.street_nom, s.home, s.korp, s.kv
			  )sh
			  where
				  sh.fio like $1
			  limit 15
			  `
	}

	
}

/*

*/