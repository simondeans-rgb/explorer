// World cities dataset for offline GPS -> city matching (photo scan).
// Generated from GeoNames cities15000 (https://www.geonames.org/, CC-BY 4.0):
// population >= 50k plus national/admin capitals; sections-of-cities excluded.
// Format per line: name\tlat\tlng\tcountryCode\tmatchRadiusKm.
// Regenerate with scratchpad/gen_cities.py. Parsed lazily by lib/cityLookup.ts.
export const CITIES_TSV = `Shanghai	31.22	121.46	CN	30
Beijing	39.91	116.40	CN	30
Shenzhen	22.55	114.07	CN	30
Guangzhou	23.12	113.25	CN	30
Kinshasa	-4.33	15.31	CD	30
Istanbul	41.01	28.95	TR	30
Lagos	6.45	3.39	NG	30
Ho Chi Minh City	10.82	106.63	VN	30
Chengdu	30.67	104.07	CN	30
Lahore	31.56	74.35	PK	30
Mumbai	19.07	72.88	IN	30
São Paulo	-23.55	-46.64	BR	30
Mexico City	19.43	-99.13	MX	30
Karachi	24.86	67.01	PK	30
Tianjin	39.14	117.18	CN	30
Delhi	28.65	77.23	IN	30
Wuhan	30.58	114.27	CN	30
Moscow	55.75	37.62	RU	30
Dhaka	23.71	90.41	BD	30
Seoul	37.57	126.98	KR	30
Tokyo	35.69	139.69	JP	30
Dongguan	23.02	113.75	CN	30
Cairo	30.06	31.25	EG	30
Xi’an	34.26	108.93	CN	30
Johannesburg	-26.20	28.04	ZA	30
Nanjing	32.06	118.78	CN	30
Hangzhou	30.29	120.16	CN	30
Foshan	23.03	113.13	CN	30
London	51.51	-0.13	GB	30
New York City	40.71	-74.01	US	30
Jakarta	-6.21	106.85	ID	30
Bengaluru	12.97	77.59	IN	30
Hanoi	21.02	105.84	VN	30
Taipei	25.05	121.53	TW	30
Lima	-12.04	-77.03	PE	30
Bogotá	4.61	-74.08	CO	30
Chongqing	29.56	106.56	CN	30
Hong Kong	22.28	114.17	HK	30
Baghdad	33.34	44.40	IQ	30
Wuzhong	37.99	106.20	CN	30
Qingdao	36.06	120.38	CN	30
Tehran	35.69	51.42	IR	30
Shenyang	41.79	123.43	CN	30
Hyderabad	17.38	78.46	IN	30
Rio de Janeiro	-22.91	-43.18	BR	30
Suzhou	31.30	120.60	CN	30
Ahmedabad	23.03	72.59	IN	30
Abidjan	5.35	-4.00	CI	30
Pudong	31.24	121.50	CN	30
Sydney	-33.87	151.21	AU	30
Singapore	1.29	103.85	SG	30
Melbourne	-37.81	144.96	AU	30
Dar es Salaam	-6.82	39.27	TZ	30
Saint Petersburg	59.94	30.31	RU	30
Alexandria	31.20	29.92	EG	30
Harbin	45.75	126.65	CN	30
Bangkok	13.75	100.50	TH	30
Hefei	31.86	117.28	CN	30
Dalian	38.91	121.60	CN	22
Kano	12.00	8.52	NG	22
Santiago	-33.46	-70.65	CL	22
Cape Town	-33.93	18.42	ZA	22
Peshawar	34.01	71.58	PK	22
Changchun	43.88	125.32	CN	22
Jeddah	21.49	39.19	SA	22
Chennai	13.09	80.28	IN	22
Kolkata	22.56	88.36	IN	22
Xiamen	24.48	118.08	CN	22
Surat	21.20	72.83	IN	22
Yangon	16.81	96.16	MM	22
Bao'an	22.55	113.88	CN	22
Kabul	34.53	69.17	AF	22
Nairobi	-1.28	36.82	KE	22
Wuxi	31.57	120.29	CN	22
Giza	30.01	31.21	EG	22
Jinan	36.67	117.00	CN	22
Taiyuan	37.87	112.56	CN	22
Zhengzhou	34.76	113.65	CN	22
Bamako	12.61	-7.98	ML	22
Riyadh	24.69	46.72	SA	22
New Taipei City	25.06	121.46	TW	22
Shijiazhuang	38.04	114.48	CN	22
Chattogram	22.34	91.83	BD	22
Addis Ababa	9.02	38.75	ET	22
Kunming	25.04	102.72	CN	22
Zhongshan	22.52	113.38	CN	22
Nanning	22.82	108.32	CN	22
Shantou	23.35	116.68	CN	22
Los Angeles	34.05	-118.24	US	22
Faisalabad	31.42	73.09	PK	22
Dubai	25.08	55.31	AE	22
Yokohama	35.43	139.65	JP	22
Fuzhou	26.06	119.31	CN	22
Ningbo	29.88	121.55	CN	22
Casablanca	33.59	-7.61	MA	22
Ibadan	7.38	3.91	NG	22
Puyang	29.46	119.89	CN	22
Ankara	39.92	32.85	TR	22
Shiyan	32.65	110.78	CN	22
Berlin	52.52	13.41	DE	22
Tangshan	39.64	118.18	CN	22
Rawalpindi	33.60	73.05	PK	22
Lüliang	37.52	111.14	CN	22
Durban	-29.86	31.03	ZA	22
Changzhou	31.77	119.95	CN	22
Busan	35.10	129.03	KR	22
Madrid	40.42	-3.70	ES	22
Pyongyang	39.03	125.75	KP	22
Zibo	36.79	118.06	CN	22
Pune	18.52	73.86	IN	22
Bursa	40.20	29.06	TR	22
Changsha	28.20	112.97	CN	22
Quezon City	14.65	121.05	PH	22
Jaipur	26.92	75.79	IN	22
Guiyang	26.58	106.72	CN	22
Ürümqi	43.80	87.60	CN	22
Surabaya	-7.25	112.75	ID	22
Incheon	37.46	126.71	KR	22
Lanzhou	36.06	103.84	CN	22
Caracas	10.49	-66.88	VE	22
Kyiv	50.45	30.52	UA	22
İzmir	38.41	27.14	TR	22
Huizhou	23.11	114.42	CN	22
Buenos Aires	-34.61	-58.38	AR	22
Haikou	20.03	110.35	CN	22
Taichung	24.15	120.68	TW	22
Kanpur	26.47	80.35	IN	22
Toronto	43.71	-79.40	CA	22
Quito	-0.23	-78.52	EC	22
Brisbane	-27.47	153.03	AU	22
Luanda	-8.84	13.23	AO	22
Osaka	34.69	135.50	JP	22
Linyi	35.06	118.34	CN	22
Baoding	38.87	115.46	CN	22
Kaohsiung	22.62	120.31	TW	22
Brooklyn	40.65	-73.95	US	22
Guayaquil	-2.20	-79.89	EC	22
Belo Horizonte	-19.92	-43.94	BR	22
Minhang	31.11	121.37	CN	22
Bazhong	31.87	106.74	CN	22
Salvador	-12.98	-38.49	BR	22
Abuja	9.06	7.50	NG	22
Gazipur	24.00	90.42	BD	22
Chicago	41.85	-87.65	US	22
Wenzhou	28.00	120.67	CN	22
Bekasi	-6.23	106.99	ID	22
Dakar	14.69	-17.44	SN	22
Haiphong	20.86	106.68	VN	22
Yunfu	22.93	112.04	CN	22
Mogadishu	2.04	45.34	SO	22
Kumasi	6.69	-1.62	GH	22
Bandung	-6.92	107.61	ID	22
Gujranwala	32.16	74.19	PK	22
Huai'an	33.59	119.02	CN	22
Medan	3.58	98.67	ID	22
Lucknow	26.84	80.92	IN	22
Ouagadougou	12.37	-1.53	BF	22
Nagpur	21.15	79.08	IN	22
Fortaleza	-3.72	-38.54	BR	22
Cali	3.43	-76.52	CO	22
Perth	-31.95	115.86	AU	22
Daegu	35.87	128.59	KR	22
Algiers	36.73	3.09	DZ	22
Nanchang	28.68	115.85	CN	22
Baku	40.38	49.89	AZ	22
Hohhot	40.81	111.65	CN	22
Nagoya	35.18	136.91	JP	22
Rome	41.89	12.51	IT	22
Queens	40.68	-73.84	US	22
Houston	29.76	-95.36	US	22
Mashhad	36.30	59.61	IR	22
Shaoxing	30.00	120.58	CN	22
Nantong	32.03	120.87	CN	22
Baoshan	31.41	121.49	CN	22
Yantai	37.48	121.44	CN	22
Gaziantep	37.06	37.38	TR	22
Lubumbashi	-11.66	27.48	CD	22
Manaus	-3.10	-60.02	BR	22
Lusaka	-15.41	28.29	ZM	22
Brasília	-15.78	-47.93	BR	22
Zhuhai	22.28	113.57	CN	22
Santo Domingo	18.47	-69.89	DO	22
Lomé	6.13	1.22	TG	22
Multan	30.20	71.48	PK	22
Havana	23.13	-82.38	CU	22
Depok	-6.40	106.82	ID	22
Baotou	40.65	109.84	CN	22
Paris	48.85	2.35	FR	22
Coimbatore	11.01	76.97	IN	22
Qingyang	35.71	107.64	CN	22
Port Harcourt	4.78	7.01	NG	22
Pretoria	-25.74	28.19	ZA	22
Córdoba	-31.41	-64.19	AR	22
Mbuji-Mayi	-6.14	23.59	CD	22
Aleppo	36.20	37.16	SY	22
Kunshan	31.38	120.95	CN	22
Weifang	36.71	119.10	CN	22
Zunyi	27.69	106.91	CN	22
La Paz	-16.50	-68.15	BO	22
Lianyungang	34.60	119.22	CN	22
Medellín	6.25	-75.57	CO	18
Indore	22.72	75.83	IN	18
Brazzaville	-4.27	15.28	CG	18
Tashkent	41.26	69.22	UZ	18
Ganzhou	25.85	114.93	CN	18
Almaty	43.25	76.91	KZ	18
Khartoum	15.55	32.53	SD	18
Hamburg	53.55	9.99	DE	18
Sapporo	43.07	141.35	JP	18
Songjiang	31.03	121.22	CN	18
Accra	5.56	-0.20	GH	18
Curitiba	-25.43	-49.27	BR	18
Ordos	39.61	109.78	CN	18
Sanaa	15.35	44.21	YE	18
Conakry	9.54	-13.68	GN	18
Tangerang	-6.18	106.63	ID	18
Tijuana	32.50	-117.00	MX	18
Hyderabad	25.40	68.38	PK	18
Beirut	33.89	35.50	LB	18
Jieyang	23.54	116.37	CN	18
Jilin	43.85	126.56	CN	18
Jiading	31.39	121.24	CN	18
Bucharest	44.43	26.11	RO	18
Camayenne	9.54	-13.69	GN	18
Kakamega	0.28	34.75	KE	18
Shangqiu	34.41	115.66	CN	18
Nanchong	30.80	106.08	CN	18
Tainan	22.99	120.21	TW	18
Datong	40.09	113.29	CN	18
Kaduna	10.53	7.44	NG	18
Omdurman	15.64	32.48	SD	18
Davao	7.07	125.61	PH	18
Thāne	19.20	72.96	IN	18
Iztapalapa	19.36	-99.06	MX	18
Diyarbakır	37.91	40.22	TR	18
Santa Cruz de la Sierra	-17.79	-63.18	BO	18
Vadodara	22.30	73.21	IN	18
Adana	36.99	35.33	TR	18
Nanyang	33.01	112.55	CN	18
Abu Dhabi	24.45	54.40	AE	18
Palembang	-2.92	104.75	ID	18
Sharjah	25.33	55.41	AE	18
Bhopal	23.25	77.40	IN	18
Jiangmen	22.58	113.08	CN	18
Benin City	6.34	5.63	NG	18
Jiangyin	31.91	120.26	CN	18
Fuyang	32.90	115.82	CN	18
Montréal	45.51	-73.59	CA	18
Bayan Nur	40.74	107.39	CN	18
Maracaibo	10.64	-71.61	VE	18
Chaozhou	23.65	116.62	CN	18
Minsk	53.90	27.57	BY	18
Budapest	47.50	19.04	HU	18
Qingyuan	23.70	113.03	CN	18
Tai’an	36.19	117.12	CN	18
Rasapūdipalem	17.73	83.32	IN	18
Pimpri-Chinchwad	18.62	73.80	IN	18
Caloocan	14.65	120.97	PH	18
Warsaw	52.23	21.01	PL	18
Soweto	-26.27	27.86	ZA	18
Semarang	-6.99	110.42	ID	18
Puebla	19.05	-98.21	MX	18
Vienna	48.21	16.37	AT	18
Barcelona	41.39	2.16	ES	18
Patna	25.59	85.14	IN	18
Mosul	36.34	43.12	IQ	18
Kallakurichi	11.73	78.96	IN	18
Kampala	0.32	32.58	UG	18
Xining	36.63	101.76	CN	18
Changshu	31.65	120.74	CN	18
Huainan	32.63	117.00	CN	18
Rabat	34.01	-6.83	MA	18
Recife	-8.05	-34.88	BR	18
Phoenix	33.45	-112.07	US	18
Ecatepec de Morelos	19.60	-99.06	MX	18
Lu’an	31.74	116.52	CN	18
Valencia	10.16	-68.00	VE	18
Ludhiana	30.91	75.85	IN	18
Yancheng	33.36	120.16	CN	18
Novosibirsk	55.02	82.93	RU	18
Erbil	36.19	44.01	IQ	18
Fukuoka	33.60	130.42	JP	18
Taizhou	32.49	119.91	CN	18
Daqing	46.58	125.00	CN	18
Manila	14.60	120.98	PH	18
Wuhu	31.35	118.43	CN	18
Santiago de Querétaro	20.59	-100.39	MX	18
Dazhou	31.21	107.46	CN	18
Yangzhou	32.40	119.44	CN	18
León de los Aldama	21.12	-101.68	MX	18
Makkah	21.43	39.83	SA	18
Philadelphia	39.95	-75.16	US	18
Phnom Penh	11.56	104.92	KH	18
Guilin	25.28	110.30	CN	18
Damascus	33.51	36.29	SY	18
Quetta	30.18	67.00	PK	18
Zhaoqing	23.05	112.46	CN	18
Onitsha	6.15	6.79	NG	18
Mianyang	31.47	104.68	CN	18
Auckland	-36.85	174.76	NZ	18
Isfahan	32.65	51.67	IR	18
Wanzhou	30.76	108.40	CN	18
Astana	51.18	71.45	KZ	18
Harare	-17.83	31.05	ZW	18
Monrovia	6.30	-10.80	LR	18
Putian	25.44	119.01	CN	18
Kawasaki	35.52	139.72	JP	18
Goiânia	-16.68	-49.25	BR	18
San Antonio	29.42	-98.49	US	18
Kobe	34.69	135.18	JP	18
Stockholm	59.33	18.07	SE	18
Ciudad Juárez	31.72	-106.46	MX	18
Cần Thơ	10.04	105.79	VN	18
Munich	48.14	11.58	DE	18
Khulna	22.81	89.56	BD	18
Belém	-1.46	-48.50	BR	18
Yekaterinburg	56.86	60.62	RU	18
Porto Alegre	-30.03	-51.23	BR	18
Yinchuan	38.47	106.27	CN	18
Manhattan	40.78	-73.97	US	18
Nashik	20.00	73.79	IN	18
Asunción	-25.29	-57.65	PY	18
Yiwu	29.32	120.08	CN	18
Zapopan	20.72	-103.39	MX	18
Makassar	-5.15	119.43	ID	18
Adelaide	-34.93	138.60	AU	18
Quanzhou	24.91	118.59	CN	18
Madurai	9.92	78.12	IN	18
Jinhua	29.11	119.64	CN	18
Kyoto	35.02	135.75	JP	18
Cixi	30.18	121.25	CN	18
Changde	29.03	111.70	CN	18
Kuala Lumpur	3.14	101.69	MY	18
Kayseri	38.73	35.49	TR	18
Kaifeng	34.80	114.31	CN	18
Anshan	41.12	122.99	CN	18
Karaj	35.83	50.99	IR	18
Kathmandu	27.70	85.32	NP	18
Daejeon	36.35	127.38	KR	18
Baoji	34.37	107.24	CN	18
Suqian	33.95	118.30	CN	18
Liuzhou	24.32	109.41	CN	18
Tirunelveli	8.73	77.68	IN	18
Konya	37.87	32.48	TR	18
Zhangjiagang	31.86	120.54	CN	18
Agra	27.18	78.02	IN	18
South Tangerang	-6.29	106.72	ID	18
Tabriz	38.08	46.29	IR	18
Kharkiv	49.98	36.25	UA	18
Jinjiang	24.82	118.57	CN	18
Faridabad	28.41	77.31	IN	18
Bozhou	33.88	115.77	CN	18
Qujing	25.48	103.78	CN	18
San Diego	32.72	-117.16	US	18
Gwangju	35.15	126.92	KR	18
Zhanjiang	21.23	110.39	CN	18
Fushun	41.89	123.94	CN	18
Rājkot	22.29	70.79	IN	18
Luoyang	34.67	112.44	CN	18
Guadalajara	20.68	-103.35	MX	18
The Bronx	40.85	-73.87	US	18
Guankou	28.16	113.63	CN	18
Huế	16.46	107.60	VN	18
Milan	45.46	9.19	IT	18
Najafgarh	28.61	76.98	IN	18
N'Djamena	12.11	15.04	TD	18
Handan	36.61	114.49	CN	18
Bannu	32.99	70.60	PK	18
Yichang	30.71	111.28	CN	18
Antananarivo	-18.91	47.54	MG	18
Heze	35.24	115.47	CN	18
Guarulhos	-23.46	-46.53	BR	18
Abobo	5.42	-4.02	CI	18
Jamshedpur	22.80	86.19	IN	18
Douala	4.05	9.70	CM	18
Antalya	36.91	30.70	TR	18
Basrah	30.51	47.78	IQ	18
Dallas	32.78	-96.81	US	18
Saitama	35.91	139.66	JP	18
Gorakhpur	29.45	75.67	IN	18
Niamey	13.51	2.11	NE	18
Liupanshui	26.59	104.83	CN	18
Taguig	14.52	121.08	PH	18
Maoming	21.67	110.91	CN	18
Calgary	51.05	-114.09	CA	18
Tripoli	32.89	13.19	LY	18
Madinah	24.47	39.61	SA	18
Yaoundé	3.87	11.52	CM	18
Batam	1.15	104.02	ID	18
Qinzhou	21.98	108.65	CN	18
Luohe	33.57	114.03	CN	18
Xiangyang	32.04	112.14	CN	18
Yangjiang	21.86	111.96	CN	18
Yixing	31.36	119.82	CN	18
Pimpri	18.62	73.81	IN	18
Da Nang	16.07	108.22	VN	18
Amman	31.96	35.95	JO	18
Budta	7.20	124.44	PH	18
Belgrade	44.80	20.47	RS	18
Biên Hòa	10.94	106.82	VN	18
Qingpu	31.15	121.11	CN	18
Montevideo	-34.90	-56.19	UY	18
Xuchang	34.03	113.86	CN	18
Kalyān	19.24	73.14	IN	18
Zigong	29.34	104.78	CN	18
Nizhniy Novgorod	56.33	44.00	RU	18
Jepara	-6.59	110.67	ID	18
Maputo	-25.97	32.58	MZ	18
Xuzhou	34.20	117.28	CN	18
Dammam	26.43	50.10	SA	18
Neijiang	29.58	105.06	CN	18
Shiraz	29.61	52.53	IR	18
Heshan	28.57	112.35	CN	18
Dombivali	19.22	73.08	IN	18
Kananga	-5.90	22.42	CD	18
Kazan	55.79	49.12	RU	18
Jining	35.41	116.58	CN	18
Barquisimeto	10.06	-69.36	VE	18
Shubrā al Khaymah	30.13	31.25	EG	18
Putuo	31.25	121.39	CN	18
Port-au-Prince	18.54	-72.34	HT	18
Suwon	37.29	127.01	KR	18
Xinyang	32.12	114.07	CN	18
Liaocheng	36.45	116.00	CN	18
Jinzhong	37.68	112.75	CN	18
Callao	-12.05	-77.13	PE	18
Meerut	28.98	77.71	IN	18
Virār	19.46	72.81	IN	18
Nowrangapur	19.23	82.55	IN	18
Karbala	32.62	44.02	IQ	18
Changzhi	36.18	113.11	CN	18
Tianshui	34.58	105.74	CN	18
Sadr City	33.39	44.46	IQ	18
Yangpu	31.26	121.52	CN	18
Mombasa	-4.05	39.66	KE	18
Mandalay	21.97	96.08	MM	18
Srinagar	34.09	74.81	IN	18
Barranquilla	10.97	-74.78	CO	18
Chelyabinsk	55.16	61.43	RU	18
Mérida	20.97	-89.62	MX	18
Hiroshima	34.40	132.45	JP	18
Santiago de los Caballeros	19.45	-70.69	DO	18
Shymkent	42.31	69.60	KZ	18
Weinan	34.50	109.51	CN	18
Ghāziābād	28.67	77.44	IN	18
Matola	-25.96	32.46	MZ	18
Dhanbad	23.80	86.43	IN	18
Arequipa	-16.40	-71.54	PE	18
Fes	34.03	-5.00	MA	18
Gustavo Adolfo Madero	19.49	-99.11	MX	18
Nouakchott	18.09	-15.98	MR	18
Kisangani	0.52	25.19	CD	18
Jiaxing	30.75	120.75	CN	18
Aurangabad	19.88	75.34	IN	18
Zhongwei	37.51	105.19	CN	18
Omsk	54.99	73.37	RU	18
Pikine	14.76	-17.39	SN	18
Pekanbaru	0.52	101.44	ID	18
Panjin	41.12	122.07	CN	18
Bandar Lampung	-5.43	105.26	ID	18
Prague	50.09	14.42	CZ	18
Varanasi	25.32	83.01	IN	18
Jiujiang	29.70	116.00	CN	18
Samara	53.21	50.14	RU	18
Aba	5.11	7.37	NG	18
Amritsar	31.62	74.88	IN	18
Birmingham	52.48	-1.90	GB	18
Copenhagen	55.68	12.57	DK	18
Sofia	42.70	23.32	BG	18
Anyang	36.10	114.38	CN	18
Yerevan	40.18	44.51	AM	18
Vijayawada	16.51	80.65	IN	18
Fengxiang	30.86	121.47	CN	18
Bijie	27.30	105.29	CN	18
Monterrey	25.68	-100.32	MX	18
Kigali	-1.95	30.06	RW	18
Rostov-on-Don	47.22	39.71	RU	18
Zhuzhou	27.83	113.15	CN	18
Malingao	7.16	124.47	PH	18
Touba	14.86	-15.88	SN	18
Ufa	54.74	55.97	RU	18
Ranchi	23.34	85.31	IN	18
Shangrao	28.45	117.94	CN	18
Lilongwe	-13.97	33.79	MW	18
Huaibei	33.97	116.79	CN	18
Maiduguri	11.85	13.16	NG	18
Xuhui	31.20	121.45	CN	18
Meishan	30.04	103.84	CN	18
Mwanza	-2.52	32.90	TZ	18
Ulsan	35.54	129.32	KR	18
Sendai	38.27	140.87	JP	18
Krasnoyarsk	56.04	92.93	RU	18
Guigang	23.12	109.59	CN	18
Oslo	59.91	10.75	NO	18
Jabalpur	23.17	79.95	IN	18
Ilorin	8.50	4.54	NG	18
Aden	12.78	45.04	YE	18
Bogor	-6.59	106.79	ID	18
Ciudad Nezahualcoyotl	19.40	-99.01	MX	18
Hengyang	26.89	112.62	CN	18
Prayagraj	25.44	81.84	IN	18
Trujillo	-8.12	-79.03	PE	18
Visakhapatnam	17.68	83.20	IN	18
Goyang-si	37.66	126.83	KR	18
Yulin	22.63	110.15	CN	18
Jodhpur	26.27	73.01	IN	18
Gwalior	26.23	78.17	IN	18
Jingzhou	30.35	112.19	CN	18
Gqeberha	-33.96	25.61	ZA	18
Tbilisi	41.69	44.83	GE	18
Voronezh	51.67	39.19	RU	18
Xinxiang	35.19	113.80	CN	18
Yichun	27.83	114.40	CN	18
Sokoto	13.06	5.24	NG	18
Jos	9.93	8.89	NG	18
Tangier	35.77	-5.80	MA	18
Xianyang	34.34	108.70	CN	18
Mexicali	32.63	-115.45	MX	18
Pointe-Noire	-4.78	11.86	CG	18
Maceió	-9.67	-35.74	BR	18
Campinas	-22.91	-47.06	BR	18
Sanya	18.25	109.51	CN	18
Rangpur	25.75	89.25	BD	18
Kirkuk	35.47	44.39	IQ	18
Ashgabat	37.95	58.38	TM	18
Shaoguan	24.80	113.58	CN	18
Howrah	22.58	88.32	IN	18
Raipur	21.23	81.63	IN	18
Changwon	35.23	128.68	KR	18
Longyan	25.07	117.02	CN	18
Köln	50.93	6.95	DE	18
Dublin	53.33	-6.25	IE	18
Tiruchirappalli	10.82	78.70	IN	18
Yongzhou	26.42	111.61	CN	18
Brussels	50.85	4.35	BE	18
Zamboanga	6.91	122.07	PH	18
Ottawa	45.41	-75.70	CA	18
Huzhou	30.87	120.09	CN	18
Volgograd	48.71	44.50	RU	18
Khartoum North	15.65	32.53	SD	18
Edmonton	53.55	-113.47	CA	18
Odesa	46.49	30.74	UA	18
Wuwei	37.93	102.63	CN	18
Jacksonville	30.33	-81.66	US	18
Fort Worth	32.73	-97.32	US	18
Hanzhong	33.08	107.02	CN	18
Hezhou	24.40	111.57	CN	18
Kota	25.18	75.84	IN	18
Zhu Cheng City	36.00	119.40	CN	18
Dongying	37.46	118.49	CN	14
Luzhou	28.89	105.43	CN	14
San Jose	37.34	-121.89	US	14
Sholapur	17.67	75.91	IN	14
Marrakesh	31.63	-8.00	MA	14
Guatemala City	14.64	-90.51	GT	14
Meizhou	24.29	116.12	CN	14
Yueyang	29.37	113.09	CN	14
Laiwu	36.19	117.66	CN	14
Benxi	41.29	123.77	CN	14
Esenyurt	41.03	28.68	TR	14
Perm	58.01	56.25	RU	14
Zaria	11.11	7.72	NG	14
Chiba	35.60	140.12	JP	14
Pingdingshan	33.73	113.32	CN	14
Ciudad Guayana	8.35	-62.64	VE	14
Sargodha	32.09	72.67	PK	14
Austin	30.27	-97.74	US	14
Managua	12.13	-86.25	NI	14
Bengbu	32.94	117.36	CN	14
Salé	34.05	-6.80	MA	14
Jerusalem	31.77	35.22	IL	14
Chandigarh	30.74	76.79	IN	14
Dnipro	48.47	35.04	UA	14
Cebu City	10.32	123.89	PH	14
Sanhe	39.98	117.07	CN	14
Tiruppur	11.12	77.35	IN	14
Guwahati	26.18	91.75	IN	14
Xiangtan	27.85	112.90	CN	14
Linfen	36.09	111.52	CN	14
Victoria	22.29	114.14	HK	14
Zhenjiang	32.21	119.46	CN	14
Enugu	6.44	7.50	NG	14
Rosario	-32.95	-60.64	AR	14
Sulţānah	24.49	39.59	SA	14
Huludao	40.75	120.84	CN	14
Hubballi	15.35	75.13	IN	14
Padang	-0.95	100.35	ID	14
Kitakyushu	33.85	130.85	JP	14
Taiz	13.58	44.02	YE	14
Kingston	18.00	-76.79	JM	14
Rui’an	27.78	120.66	CN	14
Chihuahua	28.64	-106.09	MX	14
Nay Pyi Taw	19.75	96.13	MM	14
Eskişehir	39.78	30.52	TR	14
Mysuru	12.30	76.64	IN	14
Salem	11.65	78.16	IN	14
São Luís	-2.53	-44.30	BR	14
Seongnam-si	37.44	127.14	KR	14
Cartagena	10.40	-75.49	CO	14
Antipolo	14.63	121.12	PH	14
Columbus	39.96	-83.00	US	14
Sialkot	32.49	74.53	PK	14
Charlotte	35.23	-80.84	US	14
Laibin	23.75	109.22	CN	14
Warri	5.52	5.75	NG	14
Naples	40.85	14.27	IT	14
Xiaogan	30.93	113.92	CN	14
Campo Grande	-20.44	-54.65	BR	14
Ziyang	30.12	104.65	CN	14
Bobo-Dioulasso	11.18	-4.29	BF	14
Bahawalpur	29.40	71.68	PK	14
Quzhou	28.96	118.87	CN	14
Blantyre	-15.78	35.01	MW	14
Donetsk	48.02	37.80	UA	14
Abū Ghurayb	33.31	44.18	IQ	14
Qom	34.64	50.88	IR	14
Bishkek	42.87	74.59	KG	14
Zaozhuang	34.86	117.55	CN	14
Krasnodar	45.05	38.98	RU	14
Natal	-5.79	-35.21	BR	14
Pingxiang	27.62	113.85	CN	14
Malang	-7.98	112.63	ID	14
Cancún	21.17	-86.85	MX	14
Indianapolis	39.77	-86.16	US	14
Gurugram	28.46	77.03	IN	14
Bhubaneswar	20.27	85.83	IN	14
Zhoushan	29.99	122.20	CN	14
Qiqihar	47.34	123.96	CN	14
Mulenvos	-8.87	13.33	AO	14
Sulaymaniyah	35.56	45.43	IQ	14
Marseille	43.30	5.38	FR	14
Puning	23.31	116.17	CN	14
Bhiwandi	19.30	73.06	IN	14
Soshanguve	-25.47	28.10	ZA	14
Teresina	-5.09	-42.80	BR	14
Ankang	32.68	109.02	CN	14
Jalandhar	31.33	75.58	IN	14
Rotterdam	51.92	4.48	NL	14
Langfang	39.52	116.71	CN	14
Duque de Caxias	-22.79	-43.31	BR	14
Viana	-8.91	13.37	AO	14
Jiaozuo	35.24	113.24	CN	14
Samarinda	-0.49	117.15	ID	14
Wanxian	30.82	108.37	CN	14
Guang’an	30.47	106.64	CN	14
Johor Bahru	1.47	103.76	MY	14
Arifwala	30.29	73.07	PK	14
Pasig City	14.59	121.06	PH	14
Cheongju-si	36.64	127.49	KR	14
Kanayannur	9.97	76.27	IN	14
Tegucigalpa	14.08	-87.21	HN	14
Bucheon-si	37.50	126.78	KR	14
Thanh Hóa	19.80	105.77	VN	14
Turin	45.07	7.69	IT	14
Al Ain City	24.19	55.76	AE	14
Libreville	0.39	9.45	GA	14
Saratov	51.54	45.99	RU	14
Ulan Bator	47.91	106.88	MN	14
Weihai	37.51	122.11	CN	14
Takeo	10.99	104.78	KH	14
Nova Iguaçu	-22.76	-43.45	BR	14
Cochabamba	-17.38	-66.16	BO	14
Ahvaz	31.32	48.68	IR	14
Vientiane	17.97	102.60	LA	14
São Bernardo do Campo	-23.69	-46.56	BR	14
Xinyu	27.80	114.93	CN	14
Pietermaritzburg	-29.62	30.39	ZA	14
Yibin	28.76	104.64	CN	14
Naucalpan de Juárez	19.48	-99.24	MX	14
Kampung Baru Subang	3.15	101.53	MY	14
Bouaké	7.69	-5.03	CI	14
Taicang	31.45	121.09	CN	14
San Francisco	37.77	-122.42	US	14
Sakai	34.58	135.47	JP	14
Valencia	39.47	-0.38	ES	14
Jinshan	30.84	121.29	CN	14
Chenzhou	25.80	113.03	CN	14
João Pessoa	-7.12	-34.86	BR	14
Bukavu	-2.49	28.84	CD	14
Kraków	50.06	19.94	PL	14
Barcelona	10.14	-64.69	VE	14
Bangui	4.36	18.55	CF	14
Hermosillo	29.09	-110.97	MX	14
Bhayandar	19.30	72.85	IN	14
Culiacán	24.80	-107.39	MX	14
Petaling Jaya	3.11	101.61	MY	14
Anqing	30.51	117.05	CN	14
Oran	35.70	-0.64	DZ	14
Freetown	8.49	-13.24	SL	14
San Pedro Sula	15.51	-88.03	HN	14
Narela	28.85	77.09	IN	14
Xingtai	37.06	114.49	CN	14
Niigata	37.92	139.04	JP	14
Muscat	23.58	58.41	OM	14
Zarqa	32.07	36.09	JO	14
Çankaya	39.92	32.86	TR	14
Küçükçekmece	40.99	28.77	TR	14
Hamamatsu	34.70	137.73	JP	14
Kolwezi	-10.71	25.47	CD	14
Vinh	18.67	105.69	VN	14
Thiruvananthapuram	8.49	76.95	IN	14
Zhaotong	27.32	103.72	CN	14
Panzhihua	26.59	101.71	CN	14
Chuzhou	32.32	118.30	CN	14
Seattle	47.61	-122.33	US	14
Port Said	31.27	32.30	EG	14
Cúcuta	7.91	-72.50	CO	14
Homs	34.72	36.73	SY	14
Xuancheng	30.95	118.76	CN	14
Ibb	13.97	44.18	YE	14
Tasikmalaya	-7.33	108.22	ID	14
Nampula	-15.12	39.27	MZ	14
Shangyu	30.02	120.87	CN	14
Bujumbura	-3.38	29.36	BI	14
Tyumen	57.15	65.53	RU	14
Erzurum	39.91	41.28	TR	14
Anshun	26.25	105.93	CN	14
Dodoma	-6.17	35.74	TZ	14
Rajshahi	24.37	88.60	BD	14
Dera Ismail Khan	31.83	70.90	PK	14
Sorocaba	-23.50	-47.46	BR	14
Wuzhou	23.48	111.29	CN	14
Ipoh	4.58	101.08	MY	14
Qinhuangdao	39.94	119.59	CN	14
Benghazi	32.11	20.07	LY	14
Uberlândia	-18.92	-48.28	BR	14
Alīgarh	27.88	78.07	IN	14
Shaoyang	27.24	111.46	CN	14
Malatya	38.35	38.32	TR	14
Winnipeg	49.88	-97.15	CA	14
Ōta	35.56	139.72	JP	14
Andijon	40.78	72.35	UZ	14
Bareilly	28.37	79.43	IN	14
Buraydah	26.33	43.97	SA	14
Hegang	47.35	130.29	CN	14
Morelia	19.70	-101.18	MX	14
Riga	56.95	24.11	LV	14
Amsterdam	52.37	4.89	NL	14
Cagayan de Oro	8.48	124.65	PH	14
Ma’anshan	31.69	118.51	CN	14
Shah Alam	3.09	101.53	MY	14
Bağcılar	41.04	28.86	TR	14
Shizuishan	38.98	106.39	CN	14
Kumamoto	32.81	130.69	JP	14
Oyo	7.85	3.93	NG	14
Serang	-6.12	106.15	ID	14
Torreón	25.54	-103.42	MX	14
Deyang	31.13	104.38	CN	14
Abeokuta	7.16	3.35	NG	14
Al Ḩudaydah	14.80	42.95	YE	14
Yangquan	37.86	113.56	CN	14
Akure	7.25	5.19	NG	14
Denver	39.74	-104.98	US	14
Osasco	-23.53	-46.79	BR	14
Kikolo	-8.78	13.33	AO	14
Maianga	-8.85	13.24	AO	14
São José dos Campos	-23.18	-45.89	BR	14
Aihara	35.60	139.32	JP	14
Evaton	-26.53	27.85	ZA	14
Valenzuela	14.70	120.97	PH	14
Muzaffarābād	34.37	73.47	PK	14
Okayama	34.65	133.93	JP	14
San Luis Potosí	22.15	-100.97	MX	14
Aguascalientes	21.88	-102.28	MX	14
General Santos	6.11	125.17	PH	14
Zhumadian	32.98	114.03	CN	14
Morādābād	28.84	78.78	IN	14
Sagamihara	35.57	139.24	JP	14
Mississauga	43.58	-79.66	CA	14
Lviv	49.84	24.02	UA	14
Namangan	41.00	71.67	UZ	14
Zaporizhzhya	47.85	35.12	UA	14
Zanzibar	-6.16	39.20	TZ	14
Saltillo	25.43	-100.98	MX	14
Latakia	35.53	35.79	SY	14
Warangal	18.00	79.58	IN	14
Paranaque City	14.48	121.02	PH	14
Tolyatti	53.53	49.35	RU	14
Santo Domingo Oeste	18.50	-70.00	DO	14
Santo Domingo Este	18.49	-69.85	DO	14
Battagram	34.68	73.02	PK	14
Suez	29.97	32.53	EG	14
Ribeirão Preto	-21.18	-47.81	BR	14
Agadir	30.42	-9.60	MA	14
Sarajevo	43.85	18.36	BA	14
Balikpapan	-1.27	116.83	ID	14
Changning	31.22	121.42	CN	14
Bauchi	10.31	9.84	NG	14
Shizuoka	34.98	138.38	JP	14
Tunis	36.82	10.17	TN	14
Zhangjiakou	40.78	114.87	CN	14
Washington	38.90	-77.04	US	14
Nashville	36.17	-86.78	US	14
Fuxin	42.02	121.66	CN	14
Ta’if	21.27	40.42	SA	14
Huangshi	30.25	115.05	CN	14
Liaoyang	41.27	123.17	CN	14
Hlaingthaya	16.85	96.07	MM	14
Beira	-19.84	34.84	MZ	14
Hongkou	31.25	121.49	CN	14
Zaragoza	41.66	-0.88	ES	14
Sevilla	37.38	-5.97	ES	14
Baise	23.89	106.63	CN	14
Pontianak	-0.03	109.33	ID	14
Situbondo	-7.71	114.01	ID	14
Agege	6.62	3.33	NG	14
Binzhou	37.37	118.02	CN	14
Oklahoma City	35.47	-97.52	US	14
Yuncheng	35.02	110.99	CN	14
Dezhou	37.45	116.37	CN	14
Dushanbe	38.54	68.78	TJ	14
Cotonou	6.37	2.42	BJ	14
El Paso	31.76	-106.49	US	14
Guadalupe	25.68	-100.26	MX	14
Wrocław	51.10	17.03	PL	14
Denpasar	-8.65	115.22	ID	14
Guntur	16.30	80.46	IN	14
Katsina	12.99	7.60	NG	14
Sanmenxia	34.78	111.19	CN	14
E’zhou	30.40	114.89	CN	14
Camama	-8.94	13.27	AO	14
Tabuk	28.40	36.57	SA	14
Kitwe	-12.80	28.21	ZM	14
Bulawayo	-20.15	28.58	ZW	14
Mudanjiang	44.55	129.63	CN	14
Aracaju	-10.91	-37.07	BR	14
Joinville	-26.30	-48.85	BR	14
Athens	37.98	23.73	GR	14
Zagreb	45.81	15.98	HR	14
Leshan	29.56	103.76	CN	14
Santo André	-23.66	-46.54	BR	14
Vancouver	49.25	-123.12	CA	14
Rizhao	35.41	119.53	CN	14
Helsinki	60.17	24.94	FI	14
Cheonan	36.81	127.15	KR	14
Acapulco de Juárez	16.85	-99.91	MX	14
Banjarmasin	-3.32	114.59	ID	14
Puducherry	11.93	79.83	IN	14
Suining	30.51	105.57	CN	14
Brampton	43.68	-79.77	CA	14
Golfe	-8.87	13.26	AO	14
Soacha	4.58	-74.22	CO	14
Boston	42.36	-71.06	US	14
Tlalnepantla	19.54	-99.20	MX	14
Portland	45.52	-122.68	US	14
Calumbo	-9.15	13.42	AO	14
Tlaquepaque	20.64	-103.29	MX	14
Frankfurt am Main	50.12	8.68	DE	14
Macau	22.20	113.55	MO	14
Palermo	38.12	13.36	IT	14
Izhevsk	56.85	53.20	RU	14
Colombo	6.94	79.85	LK	14
Maturín	9.75	-63.18	VE	14
Amravati	20.93	77.75	IN	14
Detroit	42.33	-83.05	US	14
Osogbo	7.77	4.56	NG	14
Bikaner	28.02	73.31	IN	14
Jaboatão dos Guararapes	-8.11	-35.01	BR	14
Hoji ya Henda	-8.81	13.29	AO	14
Las Vegas	36.17	-115.14	US	14
Hwaseong-si	37.21	126.82	KR	14
Gold Coast	-28.00	153.43	AU	14
Łódź	51.77	19.47	PL	14
Jeonju	35.82	127.15	KR	14
Chongming	31.62	121.70	CN	14
Al Aḩmadī	29.08	48.08	KW	14
Cuenca	-2.90	-79.00	EC	14
Chisinau	47.01	28.86	MD	14
Likasi	-10.98	26.74	CD	14
Jambi City	-1.60	103.62	ID	14
Hebi	35.73	114.29	CN	14
Comilla	23.46	91.19	BD	14
Tshikapa	-6.42	20.80	CD	14
Chunian	30.97	73.98	PK	14
Kochi	9.94	76.26	IN	14
Memphis	35.15	-90.05	US	14
Jingmen	31.03	112.20	CN	14
Barnaul	53.36	83.73	RU	14
Dandong	40.13	124.39	CN	14
Piura	-5.18	-80.66	PE	14
Bhilai	21.21	81.43	IN	14
Ndola	-12.96	28.64	ZM	14
Contagem	-19.93	-44.05	BR	14
Ulyanovsk	54.33	48.39	RU	14
Djibouti	11.59	43.15	DJ	14
Glasgow	55.87	-4.26	GB	14
Panshan	41.19	122.05	CN	14
Louisville	38.25	-85.76	US	14
Irkutsk	52.30	104.29	RU	14
Ansan-si	37.32	126.82	KR	14
Al Mansurah	31.04	31.38	EG	14
Kermanshah	34.31	47.06	IR	14
Jiaozhou	36.28	120.00	CN	14
Düsseldorf	51.22	6.78	DE	14
Suizhou	31.71	113.36	CN	14
Villa Nueva	14.53	-90.59	GT	14
Khabarovsk	48.46	135.10	RU	14
Cuiabá	-15.60	-56.10	BR	14
Arusha	-3.37	36.68	TZ	14
Feira de Santana	-12.27	-38.97	BR	14
Las Piñas	14.45	120.98	PH	14
Chizhou	30.66	117.48	CN	14
Coyoacán	19.35	-99.16	MX	14
Stuttgart	48.78	9.18	DE	14
Ya'an	29.99	103.00	CN	14
Cuttack	20.46	85.88	IN	14
Borivli	19.23	72.86	IN	14
Chiclayo	-6.77	-79.85	PE	14
Yaroslavl	57.63	39.87	RU	14
Gothenburg	57.71	11.97	SE	14
Kawaguchi	35.81	139.71	JP	14
Bukit Rahman Putra	3.22	101.56	MY	14
Jhang Sadr	31.27	72.32	PK	14
Ha'il	27.52	41.69	SA	14
Bhavnagar	21.76	72.15	IN	14
Benoni	-26.19	28.32	ZA	14
Vladivostok	43.11	131.87	RU	14
Jinzhou	41.11	121.14	CN	14
Tuxtla	16.75	-93.12	MX	14
Kryvyy Rih	47.91	33.39	UA	14
Sanming	26.25	117.62	CN	14
Islamabad	33.72	73.04	PK	14
Sāngli	16.85	74.56	IN	14
Jamnagar	22.47	70.07	IN	14
Lubango	-14.92	13.49	AO	14
Pokhara	28.27	83.97	NP	14
Shuangyashan	46.68	131.13	CN	14
Borama	9.94	43.18	SO	14
Luancheng	37.88	114.65	CN	14
Makhachkala	42.98	47.50	RU	14
Anyang-si	37.39	126.93	KR	14
Huambo	-12.78	15.74	AO	14
Samarkand	39.65	66.96	UZ	14
Mengzi	23.37	103.38	CN	14
Kagoshima	31.57	130.55	JP	14
Mukalla	14.54	49.12	YE	14
Rasht	37.28	49.59	IR	14
Mar del Plata	-38.00	-57.56	AR	14
Essen	51.46	7.01	DE	14
Al Maḩallah al Kubrá	30.97	31.17	EG	14
Málaga	36.72	-4.42	ES	14
Shekhupura	31.71	73.99	PK	14
Yingkou	40.66	122.23	CN	14
Zhangzhou	24.51	117.66	CN	14
Reynosa	26.08	-98.28	MX	14
Thuận An	10.92	106.71	VN	14
Dortmund	51.51	7.47	DE	14
Baltimore	39.29	-76.61	US	14
Pelentong	1.52	103.82	MY	14
Cimahi	-6.87	107.54	ID	14
Londrina	-23.31	-51.16	BR	14
Bucaramanga	7.12	-73.12	CO	14
Genoa	44.40	8.94	IT	14
Hachiōji	35.66	139.32	JP	14
Malacca	2.20	102.24	MY	14
Nha Trang	12.25	109.19	VN	14
Kerman	30.28	57.08	IR	14
Orūmīyeh	37.55	45.08	IR	14
Bahçelievler	41.00	28.86	TR	14
Tanta	30.79	31.00	EG	14
Jammu	32.74	74.86	IN	14
Iskandar Puteri	1.39	103.62	MY	14
Calamba	14.21	121.17	PH	14
Tlalpan	19.30	-99.16	MX	14
Herāt	34.35	62.20	AF	14
Gujrat	32.57	74.08	PK	14
Tomsk	56.50	84.98	RU	14
Umraniye	41.02	29.12	TR	14
Shihezi	44.30	86.04	CN	14
Nakuru	-0.31	36.07	KE	14
Hamilton	43.25	-79.85	CA	14
Irbid	32.56	35.85	JO	14
Manchester	53.48	-2.24	GB	14
Kota Bharu	6.12	102.24	MY	14
Surrey	49.11	-122.83	CA	14
Meknes	33.89	-5.55	MA	14
Puente Alto	-33.61	-70.58	CL	14
Nyala	12.05	24.88	SD	14
Dresden	51.05	13.74	DE	14
Orenburg	51.77	55.10	RU	14
Albuquerque	35.08	-106.65	US	14
Bokāro	23.67	86.15	IN	14
Asmara	15.34	38.93	ER	14
Sukkur	27.70	68.86	PK	14
Milwaukee	43.04	-87.91	US	14
Wenchang	19.55	110.80	CN	14
Ile-Ife	7.48	4.56	NG	14
Gombe	10.29	11.17	NG	14
Hamhŭng	39.92	127.54	KP	14
Kemerovo	55.35	86.10	RU	14
Nasiriyah	31.06	46.26	IQ	14
Bloemfontein	-29.12	26.21	ZA	14
Sheffield	53.38	-1.47	GB	14
Santiago de Cuba	20.02	-75.82	CU	14
Siping	43.16	124.38	CN	14
Cuautitlán Izcalli	19.64	-99.22	MX	14
Benguela	-12.58	13.40	AO	14
Chuxiong	25.04	101.55	CN	14
Balbala	11.56	43.11	DJ	14
Huaihua	27.56	110.00	CN	14
Muntinlupa	14.39	121.05	PH	14
Zahedan	29.50	60.86	IR	14
Banqiao	25.01	121.47	TW	14
Nanded	19.16	77.31	IN	14
Kozhikode	11.25	75.78	IN	14
Ulanqab	40.99	113.13	CN	14
Cabinda	-5.56	12.19	AO	14
Ajegunle	6.45	3.33	NG	14
Pristina	42.67	21.17	XK	14
Jiamusi	46.80	130.31	CN	14
Korla	41.76	86.15	CN	14
Kolhāpur	16.70	74.23	IN	14
Porto Velho	-8.76	-63.90	BR	14
San Miguel de Tucumán	-26.82	-65.21	AR	14
Kuantan	3.81	103.33	MY	14
Sevastopol	44.61	33.52	UA	14
Nellore	14.45	79.99	IN	14
Bremen	53.08	8.81	DE	14
Wanning	18.80	110.38	CN	14
Owerri	5.48	7.03	NG	14
Kota Kuala Muda	5.59	100.37	MY	14
Sungai Petani	5.65	100.49	MY	14
Xinzhou	38.41	112.73	CN	14
Kotō	32.78	130.75	JP	14
Kalaburagi	17.34	76.84	IN	14
Tucson	32.22	-110.93	US	14
Selayang Baru Utara	3.25	101.67	MY	14
Vilnius	54.69	25.28	LT	14
Ajmer	26.45	74.64	IN	14
Pingdu	36.78	119.95	CN	14
Fresno	36.75	-119.77	US	14
Mbeya	-8.90	33.45	TZ	14
Juiz de Fora	-21.76	-43.35	BR	14
Calabar	4.96	8.33	NG	14
Oujda	34.68	-1.91	MA	14
Novokuznetsk	53.76	87.14	RU	14
Ryazan’	54.63	39.70	RU	14
Ji’an	27.12	114.98	CN	14
Sahiwal	31.97	72.33	PK	14
Mersin	36.81	34.64	TR	14
Nilüfer	40.21	28.92	TR	14
Leeds	53.80	-1.55	GB	14
Poznań	52.41	16.93	PL	14
Guli	28.88	120.03	CN	14
Aqsu	41.18	80.28	CN	14
Ebute Ikorodu	6.60	3.49	NG	14
Ananindeua	-1.37	-48.37	BR	14
Tanggu	39.02	117.65	CN	14
Pasir Gudang	1.46	103.91	MY	14
Astrakhan	46.35	48.04	RU	14
Okara	30.81	73.45	PK	14
Nansana	0.36	32.53	UG	14
Kimhae	35.23	128.88	KR	14
Ar Raqqah	35.95	39.01	SY	14
Québec	46.81	-71.21	CA	14
Cuauhtémoc	19.45	-99.15	MX	14
Shangluo	33.87	109.93	CN	14
Himeji	34.82	134.70	JP	14
Ibagué	4.44	-75.20	CO	14
Antwerp	51.22	4.40	BE	14
Assiut	27.18	31.18	EG	14
Hamadān	34.80	48.51	IR	14
Qionghai	19.24	110.46	CN	14
Aparecida de Goiânia	-16.82	-49.24	BR	14
Cangzhou	38.31	116.85	CN	14
Mohammadpur	24.90	88.53	BD	14
Surakarta	-7.56	110.83	ID	14
San Salvador	13.69	-89.19	SV	14
Beihai	21.48	109.12	CN	14
Van	38.49	43.38	TR	14
Sacramento	38.58	-121.49	US	14
Thủ Đức	10.85	106.77	VN	14
Üsküdar	41.02	29.01	TR	14
Penza	53.20	45.01	RU	14
Mazār-e Sharīf	36.71	67.11	AF	14
Kandahār	31.61	65.71	AF	14
Hengshui	37.74	115.68	CN	14
Dehradun	30.32	78.03	IN	14
Erode	11.34	77.73	IN	14
Lyon	45.75	4.85	FR	14
Salta	-24.81	-65.42	AR	14
Serra	-20.13	-40.31	BR	14
Esenler	41.04	28.88	TR	14
Daxing’anling	52.33	124.71	CN	14
Qui Nhon	13.78	109.22	VN	14
Al Fayyum	29.31	30.84	EG	14
Durgapur	23.52	87.31	IN	14
Utsunomiya	36.57	139.88	JP	14
Victoria de Durango	24.02	-104.66	MX	14
Belford Roxo	-22.76	-43.40	BR	14
Lisbon	38.73	-9.15	PT	14
Rahim Yar Khan	28.42	70.30	PK	14
Ulhasnagar	19.22	73.15	IN	14
Guangyuan	32.44	105.82	CN	14
Loni	28.75	77.29	IN	14
Siliguri	26.71	88.43	IN	14
Nuremberg	49.45	11.08	DE	14
Niterói	-22.88	-43.10	BR	14
Ujjain	23.18	75.78	IN	14
Hannover	52.37	9.73	DE	14
Edinburgh	55.95	-3.20	GB	14
Macapá	0.04	-51.07	BR	14
Xianning	29.84	114.32	CN	14
Toulouse	43.60	1.44	FR	14
Thembisa	-26.00	28.23	ZA	14
Carrefour	18.53	-72.40	HT	14
Matsuyama	33.84	132.77	JP	14
Bilimora	20.77	72.96	IN	14
Kasur	31.12	74.45	PK	14
Atlanta	33.75	-84.39	US	14
Heroica Matamoros	25.88	-97.50	MX	14
Makati City	14.55	121.03	PH	14
Tonghua	41.72	125.93	CN	14
Mianzhu, Deyang, Sichuan	31.34	104.22	CN	14
Naberezhnyye Chelny	55.74	52.42	RU	14
Lipetsk	52.59	39.55	RU	14
Kikwit	-5.04	18.82	CD	14
Florianópolis	-27.60	-48.55	BR	14
Banan	29.38	106.54	CN	14
Newcastle	-32.93	151.78	AU	14
Tuen Mun	22.39	113.97	HK	14
Zhangye	38.93	100.45	CN	14
Kirov	58.60	49.66	RU	14
Kashgar	39.47	75.99	CN	14
Mukim Pulai	1.53	103.67	MY	14
Najrān	17.49	44.13	SA	14
Zhoukou	33.63	114.63	CN	14
Leipzig	51.34	12.37	DE	14
Pingliang	35.54	106.69	CN	14
Huangpu	31.24	121.48	CN	14
Duisburg	51.43	6.77	DE	14
Āsansol	23.68	86.98	IN	14
Arāk	34.09	49.70	IR	14
Maipú	-33.51	-70.77	CL	14
Homyel'	52.43	30.98	BY	14
Aktobe	50.28	57.21	KZ	14
Kota Kinabalu	5.97	116.07	MY	14
Talatona	-8.92	13.19	AO	14
Kampung Larkin Lama	1.50	103.74	MY	14
Kota Damansara	3.15	101.58	MY	14
Jalalpur Pirwala	29.51	71.22	PK	14
Mangaluru	12.92	74.86	IN	10
Zhucheng	35.99	119.40	CN	10
Santa Marta	11.24	-74.19	CO	10
Matsudo	35.78	139.90	JP	10
Hāthazāri	22.51	91.81	BD	10
Lapu-Lapu City	10.31	123.95	PH	10
Karagandy	49.80	73.10	KZ	10
Loudi	27.73	111.99	CN	10
Liverpool	53.41	-2.98	GB	10
Bāndarban	22.20	92.22	BD	10
Sha Tin	22.38	114.18	HK	10
Dera Ghazi Khan	30.05	70.64	PK	10
Higashiosaka	34.67	135.58	JP	10
Pindi Bhattian	31.90	73.27	PK	10
Cheboksary	56.13	47.25	RU	10
Pohang	36.03	129.36	KR	10
Shanwei	22.78	115.35	CN	10
Montería	8.75	-75.88	CO	10
Ruiru	-1.15	36.96	KE	10
Valledupar	10.47	-73.25	CO	10
Belagavi	15.85	74.50	IN	10
Ajman	25.40	55.48	AE	10
Jianshui	24.28	101.22	CN	10
Sancaktepe	41.00	29.23	TR	10
Port Sudan	19.62	37.22	SD	10
Toluca	19.29	-99.65	MX	10
Ciudad López Mateos	19.56	-99.26	MX	10
Al Khuşūş	30.15	31.32	EG	10
Jeju City	33.51	126.52	KR	10
Gdańsk	54.35	18.65	PL	10
Miami	25.77	-80.19	US	10
Omaha	41.26	-95.94	US	10
Nishinomiya	34.72	135.33	JP	10
Masina	-4.38	15.39	CD	10
Sahāranpur	29.97	77.55	IN	10
Vellore	12.92	79.13	IN	10
Kurashiki	34.58	133.77	JP	10
Campos dos Goytacazes	-21.75	-41.33	BR	10
Angeles City	15.15	120.58	PH	10
Bhātpāra	22.87	88.40	IN	10
Jijiga	9.35	42.80	ET	10
Tula	54.20	37.62	RU	10
Najaf	32.03	44.35	IQ	10
Raleigh	35.77	-78.64	US	10
Imus	14.43	120.94	PH	10
Xichang	27.90	102.26	CN	10
Malegaon	20.55	74.53	IN	10
São José do Rio Preto	-20.82	-49.38	BR	10
Caxias do Sul	-29.17	-51.18	BR	10
Karabağlar	38.38	27.13	TR	10
Okene	7.55	6.24	NG	10
Uijeongbu-si	37.74	127.05	KR	10
Bristol	51.46	-2.60	GB	10
East London	-33.02	27.91	ZA	10
Chéngguān Qū	29.64	91.04	CN	10
Yazd	31.90	54.37	IR	10
Hargeysa	9.56	44.06	SO	10
Ōita	33.23	131.60	JP	10
Jincheng	35.50	112.83	CN	10
Taoyuan	24.99	121.30	TW	10
Eldoret	0.52	35.27	KE	10
Kansas City	39.10	-94.58	US	10
Yan’an	36.60	109.49	CN	10
Kaliningrad	54.71	20.51	RU	10
Skopje	42.00	21.43	MK	10
Kupang	-10.17	123.61	ID	10
Vereeniging	-26.67	27.93	ZA	10
The Hague	52.08	4.30	NL	10
Long Beach	33.77	-118.19	US	10
Gaya	24.80	85.00	IN	10
Iloilo	10.70	122.56	PH	10
Shouguang	36.88	118.74	CN	10
Jingdezhen	29.29	117.21	CN	10
Murcia	37.99	-1.13	ES	10
Mesa	33.42	-111.82	US	10
Halifax	44.64	-63.58	CA	10
Morogoro	-6.82	37.66	TZ	10
Marikina City	14.65	121.11	PH	10
Kenitra	34.26	-6.58	MA	10
Seeb	23.67	58.19	OM	10
Cilegon	-6.01	106.05	ID	10
Mykolayiv	46.98	31.99	UA	10
Fukuyama	34.48	133.37	JP	10
Staten Island	40.56	-74.14	US	10
Nanping	26.64	118.17	CN	10
Pereira	4.81	-75.69	CO	10
Ciudad Apodaca	25.78	-100.19	MX	10
São João de Meriti	-22.80	-43.37	BR	10
Ambattur	13.10	80.16	IN	10
Kanazawa	36.60	136.62	JP	10
Gonder	12.60	37.47	ET	10
Mandaluyong City	14.58	121.04	PH	10
Mixco	14.63	-90.61	GT	10
Longshan	42.89	125.14	CN	10
Ikare	7.53	5.75	NG	10
Nova Vida	-8.91	13.22	AO	10
Vũng Tàu	10.35	107.08	VN	10
Maracay	10.25	-67.59	VE	10
Tamale	9.40	-0.84	GH	10
Heyuan	23.73	114.68	CN	10
Dĩ An	10.91	106.77	VN	10
Kira	0.40	32.63	UG	10
Esna	25.29	32.55	EG	10
Huangshan	29.71	118.31	CN	10
Ḩamāh	35.13	36.76	SY	10
Jalgaon	21.00	75.57	IN	10
Kurnool	15.83	78.04	IN	10
Yola	9.21	12.48	NG	10
Rạch Giá	10.01	105.08	VN	10
Amagasaki	34.72	135.42	JP	10
Manado	1.48	124.85	ID	10
Santo Domingo de los Colorados	-0.25	-79.18	EC	10
Ţarţūs	34.89	35.89	SY	10
Mek'ele	13.50	39.48	ET	10
Nazrēt	8.55	39.27	ET	10
Colorado Springs	38.83	-104.82	US	10
Huancayo	-12.07	-75.21	PE	10
Al Hillah	32.46	44.42	IQ	10
Mbandaka	0.05	18.26	CD	10
Malanje	-9.54	16.34	AO	10
Namp’o	38.74	125.41	KP	10
Ciudad General Escobedo	25.80	-100.32	MX	10
Bacolod City	10.67	122.95	PH	10
Virginia Beach	36.85	-75.98	US	10
Wafangdian	39.62	122.01	CN	10
Mansilingan	10.63	122.98	PH	10
Kahama	-3.83	32.60	TZ	10
Hsinchu	24.80	120.97	TW	10
Katsushika	35.73	139.85	JP	10
Rāmgundam	18.80	79.45	IN	10
Batman	37.89	41.13	TR	10
Yongji	34.87	110.44	CN	10
Lishui	28.46	119.91	CN	10
Udaipur	24.59	73.71	IN	10
Warder	6.97	45.34	ET	10
Wenshan City	23.36	104.25	CN	10
Eslamshahr	35.55	51.24	IR	10
Juba	4.85	31.58	SS	10
Muratpaşa	36.89	30.76	TR	10
Bắc Giang	21.27	106.19	VN	10
Şanlıurfa	37.17	38.79	TR	10
Chengde	40.95	117.96	CN	10
Kursk	51.73	36.18	RU	10
Maheshtala	22.51	88.25	IN	10
Nam Định	20.43	106.18	VN	10
Constantine	36.37	6.61	DZ	10
Patiāla	30.34	76.39	IN	10
Boksburg	-26.21	28.26	ZA	10
Basuo	19.10	108.67	CN	10
Campina Grande	-7.23	-35.88	BR	10
Ensenada	31.87	-116.60	MX	10
Elazığ	38.67	39.22	TR	10
Jundiaí	-23.19	-46.88	BR	10
Xochimilco	19.25	-99.10	MX	10
Shyamnagar	22.83	88.37	IN	10
Dasmariñas	14.33	120.94	PH	10
Zhangjiajie	29.13	110.48	CN	10
Mataram	-8.58	116.12	ID	10
Korhogo	9.46	-5.63	CI	10
Piracicaba	-22.73	-47.65	BR	10
Fujisawa	35.35	139.48	JP	10
Bissau	11.86	-15.60	GW	10
Sandakan	5.84	118.12	MY	10
Mawlamyine	16.49	97.63	MM	10
Laval	45.57	-73.69	CA	10
Palma	39.57	2.65	ES	10
Montes Claros	-16.73	-43.86	BR	10
Sunch’ŏn	39.43	125.93	KP	10
Sultangazi	41.11	28.87	TR	10
Uyo	5.05	7.93	NG	10
Bei’an	48.27	126.60	CN	10
Davangere	14.47	75.93	IN	10
Ado-Ekiti	7.62	5.22	NG	10
Manizales	5.07	-75.51	CO	10
Masan	35.13	126.83	KR	10
Buôn Ma Thuột	12.67	108.04	VN	10
Stavropol	45.03	41.96	RU	10
Shuozhou	39.32	112.42	CN	10
Kashiwa	35.86	139.98	JP	10
Ogbomoso	8.13	4.24	NG	10
Tel Aviv	32.08	34.78	IL	10
Goma	-1.67	29.23	CD	10
Buenaventura	3.58	-77.00	CO	10
Welkom	-27.98	26.74	ZA	10
Sham Shui Po	22.33	114.16	HK	10
Machida	35.54	139.45	JP	10
Zagazig	30.59	31.50	EG	10
Vinnytsya	49.23	28.47	UA	10
Ismailia	30.60	32.27	EG	10
Ningde	26.66	119.52	CN	10
Akola	20.71	77.00	IN	10
Kima Kieza	-8.83	13.30	AO	10
Cusco	-13.53	-71.97	PE	10
Jiuquan	39.74	98.52	CN	10
Veracruz	19.18	-96.14	MX	10
Bryansk	53.27	34.32	RU	10
Maltepe	40.94	29.16	TR	10
Sumgayit	40.59	49.67	AZ	10
Tando Bago	24.79	68.97	PK	10
Kuala Terengganu	5.33	103.14	MY	10
Toyota	35.08	137.15	JP	10
Matadi	-5.84	13.46	CD	10
Al Kharj	24.16	47.33	SA	10
Wong Tai Sin	22.35	114.18	HK	10
Minna	9.62	6.55	NG	10
Mandaluyong	14.58	121.04	PH	10
Xalapa de Enríquez	19.53	-96.92	MX	10
Rajpur Sonarpur	22.44	88.43	IN	10
Bratislava	48.15	17.11	SK	10
Taman Petaling	3.20	101.65	MY	10
Shinagawa	33.64	133.01	JP	10
Al Ḩasakah	36.50	40.75	SY	10
Luxor	25.70	32.64	EG	10
London	42.98	-81.23	CA	10
Awasa	7.06	38.48	ET	10
Chimoio	-19.12	33.48	MZ	10
Tando Allahyar	25.46	68.72	PK	10
Daloa	6.88	-6.45	CI	10
Dingxi	35.57	104.62	CN	10
Bamenda	5.96	10.15	CM	10
Tver	56.86	35.90	RU	10
Thái Nguyên	21.59	105.85	VN	10
Boa Vista	2.82	-60.67	BR	10
Rio Branco	-9.97	-67.81	BR	10
Oakland	37.80	-122.27	US	10
Christchurch	-43.53	172.63	NZ	10
Korba	22.35	82.70	IN	10
Takamatsu	34.33	134.05	JP	10
Kowloon City	22.33	114.19	HK	10
Santos	-23.96	-46.33	BR	10
Tirana	41.33	19.82	AL	10
Petrolina	-9.40	-40.50	BR	10
Mauá	-23.67	-46.46	BR	10
San Juan	18.47	-66.11	PR	10
Alor Setar	6.12	100.36	MY	10
Tongchuan	34.90	108.95	CN	10
Pasay	14.54	121.00	PH	10
Nuevo Laredo	27.48	-99.52	MX	10
Toyama	36.70	137.22	JP	10
Tétouan	35.58	-5.37	MA	10
Zürich	47.37	8.55	CH	10
Beylikdüzü	40.98	28.64	TR	10
Việt Trì	21.32	105.40	VN	10
Azcapotzalco	19.49	-99.19	MX	10
Tampa	27.95	-82.46	US	10
Bunamwaya	0.25	32.56	UG	10
Magnitogorsk	53.40	59.01	RU	10
Tulsa	36.15	-95.99	US	10
Jhānsi	25.46	78.58	IN	10
Tseung Kwan O	22.33	114.25	HK	10
Ciudad Bolívar	8.12	-63.55	VE	10
Kampung Kangkar Teberau	1.53	103.75	MY	10
Koumassi	5.30	-3.97	CI	10
San Nicolás de los Garza	25.74	-100.30	MX	10
Guyuan	36.01	106.28	CN	10
Minneapolis	44.98	-93.26	US	10
Jayapura	-2.53	140.72	ID	10
Thoothukudi	8.77	78.13	IN	10
Ardabīl	38.25	48.29	IR	10
Ballari	15.14	76.92	IN	10
Chaoyang	41.57	120.46	CN	10
Gaza	31.50	34.47	PS	10
Maringá	-23.43	-51.94	BR	10
Yokosuka	35.28	139.67	JP	10
Kom Ombo	24.48	32.95	EG	10
Nagasaki	32.75	129.88	JP	10
Gujangbagh	37.11	79.93	CN	10
Tonalá	20.62	-103.24	MX	10
Panama City	8.99	-79.52	PA	10
Uvira	-3.40	29.14	CD	10
Hirakata	34.81	135.65	JP	10
Ivanovo	57.00	40.97	RU	10
Cumaná	10.46	-64.18	VE	10
Newcastle	-27.76	29.93	ZA	10
Gumi	36.11	128.34	KR	10
Jixi	45.29	130.96	CN	10
Diadema	-23.69	-46.62	BR	10
Kuching	1.55	110.33	MY	10
Gifu	35.42	136.76	JP	10
Caruaru	-8.28	-35.98	BR	10
Tongling	30.95	117.78	CN	10
Tarlac City	15.48	120.60	PH	10
Toyonaka	34.78	135.47	JP	10
Kassala	15.45	36.40	SD	10
Miyazaki	31.92	131.42	JP	10
Lekki	6.45	3.48	NG	10
Antofagasta	-23.65	-70.40	CL	10
Bhāgalpur	25.24	86.97	IN	10
Agartala	23.84	91.28	IN	10
Bida	9.08	6.01	NG	10
Bunia	1.56	30.25	CD	10
Antakya	36.21	36.16	TR	10
Quận Mười	10.77	106.67	VN	10
Sunshine Coast	-26.66	153.08	AU	10
Kisumu	-0.10	34.76	KE	10
Luhansk	48.57	39.31	UA	10
Bengkulu	-3.80	102.27	ID	10
Barinas	8.62	-70.23	VE	10
Vitória da Conquista	-14.87	-40.84	BR	10
Wichita	37.69	-97.34	US	10
Al Hoceïma	35.25	-3.94	MA	10
Szczecin	53.43	14.55	PL	10
Delmas	18.54	-72.30	HT	10
Vila Velha	-20.33	-40.29	BR	10
Bologna	44.49	11.34	IT	10
Sejong	36.59	127.29	KR	10
Cazenga	-8.84	13.28	AO	10
Samsun	41.28	36.34	TR	10
Tallinn	59.44	24.75	EE	10
Tanga	-5.07	39.10	TZ	10
El Obeid	13.18	30.22	SD	10
Lobito	-12.36	13.54	AO	10
Saurimo	-9.66	20.39	AO	10
Bauru	-22.31	-49.06	BR	10
Bello	6.34	-75.56	CO	10
Pasto	1.21	-77.28	CO	10
Gaomi	36.38	119.75	CN	10
Santa Fe	-31.65	-60.71	AR	10
San-Pédro	4.75	-6.64	CI	10
Makurdi	7.73	8.52	NG	10
Palu	-0.91	119.87	ID	10
Takoradi	4.90	-1.76	GH	10
Samut Prakan	13.60	100.60	TH	10
Arlington	32.74	-97.11	US	10
Khamis Mushait	18.30	42.73	SA	10
Ambato	-1.25	-78.62	EC	10
Carapicuíba	-23.52	-46.84	BR	10
Ojo de Agua	19.68	-99.01	MX	10
Windhoek	-22.56	17.08	NA	10
Abomey-Calavi	6.45	2.36	BJ	10
Bochum	51.48	7.22	DE	10
Suita	34.76	135.52	JP	10
Chak Jhumra	31.57	73.18	PK	10
Kahramanmaraş	37.58	36.93	TR	10
Chongzuo	22.38	107.37	CN	10
Okazaki	34.95	137.17	JP	10
Xico	19.27	-98.95	MX	10
Iztacalco	19.40	-99.10	MX	10
Kākināda	16.96	82.24	IN	10
Betim	-19.97	-44.20	BR	10
Las Palmas de Gran Canaria	28.10	-15.42	ES	10
Cotabato	7.22	124.25	PH	10
Bawshar	23.58	58.40	OM	10
Latur	18.40	76.57	IN	10
Tanzhou	22.26	113.47	CN	10
Wellington	-41.29	174.78	NZ	10
Mazatlán	23.22	-106.42	MX	10
Nizhny Tagil	57.92	59.97	RU	10
Irapuato	20.67	-101.36	MX	10
Ichinomiya	35.30	136.80	JP	10
Aswān	24.09	32.90	EG	10
Brno	49.20	16.61	CZ	10
Iaşi	47.17	27.60	RO	10
Krugersdorp	-26.09	27.78	ZA	10
Pānihāti	22.69	88.37	IN	10
Shibganj	25.00	89.32	BD	10
Caucaia	-3.74	-38.65	BR	10
Iquitos	-3.75	-73.25	PE	10
Toyohashi	34.77	137.38	JP	10
Hechuan	29.99	106.26	CN	10
Pétionville	18.51	-72.29	HT	10
Utrecht	52.09	5.12	NL	10
Rajamahendravaram	17.01	81.78	IN	10
Cariacica	-20.26	-40.42	BR	10
Yogyakarta	-7.80	110.36	ID	10
Dhule	20.90	74.78	IN	10
Minato	34.22	135.15	JP	10
Puchong	3.00	101.62	MY	10
Ondo	7.09	4.84	NG	10
Rohtak	28.89	76.59	IN	10
Bhawana	31.57	72.65	PK	10
Rustenburg	-25.67	27.24	ZA	10
Bakersfield	35.37	-119.02	US	10
Xuanhua	40.61	115.06	CN	10
Emalahleni	-25.87	29.23	ZA	10
Bafoussam	5.48	10.42	CM	10
Thủ Dầu Một	10.98	106.65	VN	10
Takasaki	36.33	139.02	JP	10
Seremban	2.73	101.94	MY	10
Miguel Hidalgo	19.43	-99.20	MX	10
Nagano	36.65	138.18	JP	10
Tawau	4.24	117.89	MY	10
Cardiff	51.48	-3.18	GB	10
Dachang	31.31	121.42	CN	10
Đống Đa	21.01	105.83	VN	10
Chitungwiza	-18.01	31.08	ZW	10
Fenghuang	27.94	109.60	CN	10
Umuahia	5.52	7.49	NG	10
Puerto La Cruz	10.21	-64.63	VE	10
Uşak	38.67	29.41	TR	10
Bharatpur	27.68	84.44	NP	10
Itaquaquecetuba	-23.49	-46.35	BR	10
Natore	24.41	88.99	BD	10
6th of October City	29.82	31.05	EG	10
Leicester	52.64	-1.13	GB	10
Cascavel	-24.96	-53.46	BR	10
Canberra	-35.28	149.13	AU	10
Avellaneda	-34.66	-58.37	AR	10
Nara-shi	34.69	135.80	JP	10
Florence	43.78	11.25	IT	10
Ahilyanagar	19.09	74.74	IN	10
Kollam	8.88	76.58	IN	10
Huanggang	30.45	114.87	CN	10
Bradford	53.79	-1.75	GB	10
Sukabumi	-6.92	106.93	ID	10
Bilāspur	22.08	82.16	IN	10
Malabon	14.67	120.94	PH	10
Franca	-20.54	-47.40	BR	10
Cleveland	41.50	-81.70	US	10
Iseyin	7.97	3.60	NG	10
Etobicoke	43.64	-79.57	CA	10
Yenagoa	4.93	6.27	NG	10
Gboko	7.32	9.00	NG	10
Samba	-8.88	13.20	AO	10
Olinda	-8.01	-34.86	BR	10
Pyeongtaek	36.99	127.09	KR	10
Petare	10.48	-66.81	VE	10
Bến Cát	11.15	106.60	VN	10
Anqiu	36.43	119.19	CN	10
Alanya	36.54	32.00	TR	10
Larkana	27.56	68.21	PK	10
Al Qadarif	14.03	35.38	SD	10
Hrodna	53.68	23.83	BY	10
Cibinong	-6.48	106.85	ID	10
Nawabshah	26.24	68.40	PK	10
New Orleans	29.95	-90.08	US	10
Keelung	25.13	121.74	TW	10
Malmö	55.61	13.00	SE	10
Jizhou	37.55	115.57	CN	10
Manukau City	-36.99	174.88	NZ	10
Maradi	13.50	7.10	NE	10
Burewala	30.17	72.65	PK	10
Ataşehir	40.98	29.12	TR	10
Blumenau	-26.92	-49.07	BR	10
Nanqiao	30.92	121.45	CN	10
Mingora	34.78	72.36	PK	10
Santarém	-2.44	-54.71	BR	10
Wuppertal	51.26	7.15	DE	10
Ulan-Ude	51.83	107.60	RU	10
Huocheng	44.05	80.87	CN	10
Ijebu Ode	6.82	3.92	NG	10
Maseru	-29.32	27.48	LS	10
Bhilwara	25.35	74.64	IN	10
Aurora	39.73	-104.83	US	10
Vitebsk	55.19	30.20	BY	10
Sultanbeyli	40.96	29.27	TR	10
Taraz	42.90	71.37	KZ	10
Yangsan	35.34	129.03	KR	10
San Jose del Monte	14.81	121.05	PH	10
Abū al-Kahṣīb	30.44	47.88	IQ	10
Gwangmyeong	37.48	126.87	KR	10
Zanjan	36.68	48.50	IR	10
Neiva	2.93	-75.28	CO	10
Iwaki	37.05	140.88	JP	10
Vladimir	56.14	40.40	RU	10
Tete	-16.16	33.59	MZ	10
Bacoor	14.46	120.94	PH	10
Uberaba	-19.75	-47.93	BR	10
Wakayama	34.23	135.17	JP	10
Brahmapur	19.31	84.79	IN	10
Fengshan	22.63	120.36	TW	10
Fatih	41.02	28.94	TR	10
Misratah	32.38	15.09	LY	10
Cuíto	-12.38	16.93	AO	10
Benito Juarez	19.40	-99.16	MX	10
Kyzylorda	44.85	65.51	KZ	10
Sinjhoro	26.03	68.81	PK	10
Kawagoe	35.91	139.49	JP	10
Takatsuki	34.85	135.62	JP	10
Muzaffarpur	26.12	85.39	IN	10
Tapachula	14.91	-92.26	MX	10
Lhoka	29.24	91.77	CN	10
Villahermosa	17.99	-92.94	MX	10
Setapak	3.21	101.73	MY	10
Mahilyow	53.91	30.34	BY	10
Bandar Abbas	27.19	56.28	IR	10
Ras Al Khaimah	25.79	55.94	AE	10
Cabimas	10.40	-71.45	VE	10
Kendari	-3.98	122.52	ID	10
Honolulu	21.31	-157.86	US	10
Anaheim	33.84	-117.91	US	10
Tarsus	36.92	34.89	TR	10
Pengze	29.90	116.55	CN	10
Bahir Dar	11.59	37.39	ET	10
Punāsa	22.24	76.39	IN	10
Al Maḩmūdīyah	33.06	44.37	IQ	10
Xilinhot	43.94	116.07	CN	10
Praia Grande	-24.01	-46.40	BR	10
São José dos Pinhais	-25.53	-49.21	BR	10
Quelimane	-17.88	36.89	MZ	10
Arkhangel’sk	64.55	40.55	RU	10
Muzaffarnagar	29.47	77.70	IN	10
Hulunbuir	49.21	119.76	CN	10
Dumai	1.67	101.44	ID	10
Sikasso	11.32	-5.67	ML	10
Sanandaj	35.31	47.00	IR	10
Chita	52.04	113.49	RU	10
San Pedro	14.36	121.05	PH	10
Alicante	38.35	-0.48	ES	10
Bimbo	4.26	18.42	CF	10
Kalemyo	23.19	94.06	MM	10
Belfast	54.60	-5.93	GB	10
Long Bien	21.03	105.90	VN	10
Camagüey	21.38	-77.92	CU	10
Daye	30.08	114.95	CN	10
Bilbao	43.26	-2.93	ES	10
Ambon	-3.70	128.18	ID	10
Brest	52.11	23.72	BY	10
Ribeirão das Neves	-19.77	-44.09	BR	10
Chifeng	42.27	118.96	CN	10
Central Coast	-33.43	151.37	AU	10
Corrientes	-27.47	-58.83	AR	10
Hŭngnam	39.84	127.63	KP	10
Avadi	13.11	80.11	IN	10
Yunlong	34.25	117.25	CN	10
Koshigaya	35.89	139.79	JP	10
Coventry	52.41	-1.51	GB	10
Belgorod	50.60	36.58	RU	10
Toamasina	-18.15	49.40	MG	10
Logan City	-27.64	153.11	AU	10
Ōtsu	35.00	135.87	JP	10
Kosti	13.16	32.66	SD	10
Qitaihe	45.77	131.00	CN	10
Doha	25.29	51.53	QA	10
Kadapa	14.48	78.82	IN	10
Nakano	35.70	139.67	JP	10
Cirebon	-6.71	108.56	ID	10
Turmero	10.23	-67.47	VE	10
Tokorozawa	35.80	139.47	JP	10
Cabanatuan City	15.49	120.97	PH	10
Pizhou	34.31	117.95	CN	10
Dire Dawa	9.59	41.87	ET	10
Annaba	36.90	7.77	DZ	10
Nice	43.70	7.27	FR	10
Iligan	8.23	124.24	PH	10
Soledad	10.92	-74.76	CO	10
Temara	33.93	-6.91	MA	10
Paulista	-7.94	-34.87	BR	10
Obalende	6.45	3.42	NG	10
Kukatpally	17.48	78.41	IN	10
Laixi	36.86	120.53	CN	10
Dihok	36.87	42.99	IQ	10
Kaluga	54.53	36.27	RU	10
Bắc Từ Liêm	21.07	105.75	VN	10
Celaya	20.52	-100.81	MX	10
Serekunda	13.44	-16.68	GM	10
Kafrul	23.79	90.37	BD	10
Karşıyaka	38.46	27.11	TR	10
Makiyivka	48.05	37.93	UA	10
Cuernavaca	18.93	-99.23	MX	10
Markham	43.87	-79.27	CA	10
São Vicente	-23.96	-46.39	BR	10
Kaesŏng	37.97	126.55	KP	10
Tungi	23.89	90.40	BD	10
Randburg	-26.09	28.00	ZA	10
Safi	32.30	-9.24	MA	10
Simferopol	44.96	34.11	UA	10
Lublin	51.25	22.57	PL	10
Pelotas	-31.77	-52.34	BR	10
San José	9.93	-84.08	CR	10
Orlando	28.54	-81.38	US	10
Viña del Mar	-33.02	-71.55	CL	10
Tieling	42.29	123.84	CN	10
Qazvin	36.27	50.00	IR	10
Asahikawa	43.77	142.36	JP	10
Kāmārhāti	22.67	88.37	IN	10
Tepic	21.51	-104.89	MX	10
Wŏnju	37.35	127.95	KR	10
Wad Medani	14.40	33.52	SD	10
Quận Mười Một	10.76	106.64	VN	10
Nukus	42.46	59.61	UZ	10
Konak	38.40	27.10	TR	10
Maebashi	36.40	139.08	JP	10
Kita	35.75	139.73	JP	10
Ciudad Victoria	23.74	-99.14	MX	10
Soledad de Graciano Sánchez	22.19	-100.94	MX	10
Kochi	33.55	133.53	JP	10
Bielefeld	52.03	8.53	DE	10
Blida	36.47	2.83	DZ	10
Kwai Chung	22.37	114.14	HK	10
Mandaue City	10.32	123.92	PH	10
Ganja	40.68	46.36	AZ	10
Khorramshahr	30.44	48.18	IR	10
Bonn	50.73	7.10	DE	10
Mathura	27.50	77.67	IN	10
Hechi	24.69	108.08	CN	10
Bydgoszcz	53.12	18.01	PL	10
Smolensk	54.78	32.05	RU	10
Oral	51.25	51.43	KZ	10
Khorramabad	33.49	48.36	IR	10
Soyapango	13.71	-89.14	SV	10
Tongshan	34.18	117.16	CN	10
Guédiawaye	14.77	-17.40	SN	10
Plovdiv	42.15	24.75	BG	10
Ciudad Obregón	27.49	-109.94	MX	10
Wŏnsan	39.15	127.44	KP	10
Pavlodar	52.28	76.97	KZ	10
Chānda	19.95	79.30	IN	10
Canoas	-29.92	-51.18	BR	10
Kōriyama	37.40	140.38	JP	10
Sochi	43.60	39.72	RU	10
Aksaray	38.37	34.03	TR	10
Vijayapura	16.82	75.72	IN	10
Chipata	-13.63	32.65	ZM	10
Chongjin	41.80	129.78	KP	10
Yanji	42.89	129.50	CN	10
Roodepoort	-26.16	27.87	ZA	10
Pucallpa	-8.38	-74.55	PE	10
Mogi das Cruzes	-23.52	-46.19	BR	10
Córdoba	37.89	-4.77	ES	10
Birkenhead	53.39	-3.01	GB	10
Nantes	47.22	-1.55	FR	10
Ilesa	7.63	4.74	NG	10
Pekalongan	-6.89	109.68	ID	10
Bhatara	23.80	90.45	BD	10
Espoo	60.21	24.65	FI	10
Kikuyu	-1.25	36.66	KE	10
Kluang	2.03	103.32	MY	10
Lincang	23.88	100.09	CN	10
Nottingham	52.95	-1.15	GB	10
Ramiros	-9.06	13.05	AO	10
Al ‘Amārah	31.84	47.14	IQ	10
Volzhsky	48.79	44.78	RU	10
Vaughan	43.84	-79.50	CA	10
Xingyi	25.10	104.91	CN	10
Shivamogga	13.93	75.57	IN	10
Alwar	27.56	76.62	IN	10
Uíge	-7.61	15.06	AO	10
Taubaté	-23.03	-45.56	BR	10
Ixtapaluca	19.32	-98.88	MX	10
Osh	40.53	72.80	KG	10
Portoviejo	-1.06	-80.45	EC	10
Villavicencio	4.13	-73.63	CO	10
Man’gyŏngdae-ri	38.99	125.66	KP	10
Camaçari	-12.70	-38.32	BR	10
San Miguelito	9.05	-79.47	PA	10
Shāhjānpur	27.88	79.91	IN	10
Lexington	37.99	-84.48	US	10
Tantou	22.75	113.83	CN	10
Suzano	-23.54	-46.31	BR	10
Anápolis	-16.33	-48.95	BR	10
Kaech’ŏn	39.70	125.89	KP	10
Jūnāgadh	21.52	70.46	IN	10
Islington	51.54	-0.10	GB	10
Holguín	20.89	-76.26	CU	10
Ust-Kamenogorsk	49.97	82.61	KZ	10
Tsuen Wan	22.37	114.11	HK	10
Zinder	13.81	8.99	NE	10
Saransk	54.18	45.17	RU	10
Al Diwaniyah	31.99	44.93	IQ	10
Varna	43.22	27.91	BG	10
Hafizabad	32.07	73.69	PK	10
Marne La Vallée	48.84	2.64	FR	10
Palangkaraya	-2.21	113.92	ID	10
Damanhur	31.03	30.47	EG	10
Chiniot	31.72	72.98	PK	10
Popayán	2.44	-76.61	CO	10
Reading	51.46	-0.97	GB	10
Geita	-2.87	32.23	TZ	10
Constanţa	44.18	28.63	RO	10
New Delhi	28.62	77.21	IN	10
Thessaloníki	40.64	22.93	GR	10
Thiès	14.79	-16.93	SN	10
Naha	26.21	127.68	JP	10
Riverside	33.95	-117.40	US	10
Baicheng	45.62	122.83	CN	10
Chimbote	-9.08	-78.59	PE	10
Bari	41.12	16.87	IT	10
Barueri	-23.51	-46.88	BR	10
Corpus Christi	27.80	-97.40	US	10
Thrissur	10.52	76.22	IN	10
Cherepovets	59.13	37.90	RU	10
Eloy Alfaro	-2.17	-79.84	EC	10
Al-Kut	32.51	45.82	IQ	10
Muar	2.04	102.57	MY	10
Şişli	41.06	28.99	TR	10
Lexington-Fayette	38.05	-84.46	US	10
Maroua	10.59	14.32	CM	10
Kingston upon Hull	53.74	-0.34	GB	10
Preston	53.76	-2.70	GB	10
Lianshan	40.76	120.85	CN	10
Denizli	37.77	29.09	TR	10
Ikeja	6.60	3.34	NG	10
New Cairo	30.03	31.47	EG	10
Vitória	-20.32	-40.34	BR	10
Palmira	3.54	-76.30	CO	10
Vologda	59.22	39.88	RU	10
Iligan City	8.25	124.40	PH	10
Catania	37.49	15.07	IT	10
Nizāmābād	18.67	78.10	IN	10
Cincinnati	39.13	-84.51	US	10
Percut	3.63	98.86	ID	10
Coatzacoalcos	18.15	-94.44	MX	10
Santa Ana	33.75	-117.87	US	10
Sariwŏn-si	38.51	125.76	KP	10
Botshabelo	-29.27	26.73	ZA	10
Butuan	8.95	125.54	PH	10
Shahrīār	35.66	51.06	IR	10
Qods	35.72	51.11	IR	10
Gia Lâm	21.02	105.94	VN	10
Kurgan	55.45	65.34	RU	10
Tampico	22.29	-97.88	MX	10
Akowonjo	6.61	3.31	NG	10
Cabuyao	14.27	121.13	PH	10
Tabora	-5.02	32.83	TZ	10
Kasugai	35.25	136.97	JP	10
An Nhơn	13.89	109.11	VN	10
Alimosho	6.61	3.30	NG	10
Ciudad Benito Juárez	25.65	-100.09	MX	10
Münster	51.96	7.63	DE	10
Mannheim	49.49	8.47	DE	10
Karawang	-6.31	107.32	ID	10
Akita	39.72	140.12	JP	10
Tumkūr	13.34	77.10	IN	10
Chinju	35.19	128.08	KR	10
Parbhani	19.27	76.77	IN	10
Hisar	29.15	75.72	IN	10
Iksan	35.94	126.95	KR	10
Fīrozābād	27.15	78.40	IN	10
Palmas	-10.17	-48.33	BR	10
Vladikavkaz	43.04	44.67	RU	10
Port-de-Paix	19.94	-72.83	HT	10
Damietta	31.42	31.81	EG	10
Posadas	-27.39	-55.92	AR	10
Parauapebas	-6.07	-49.90	BR	10
Brakpan	-26.24	28.37	ZA	10
Stockton	37.96	-121.29	US	10
Juazeiro do Norte	-7.21	-39.32	BR	10
Yokkaichi	34.97	136.62	JP	10
Kulti	23.73	86.84	IN	10
Tláhuac	19.29	-99.01	MX	10
Sapele	5.89	5.68	NG	10
Kashan	33.98	51.43	IR	10
Kāshān	34.00	51.44	IR	10
Pittsburgh	40.44	-80.00	US	10
Armenia	4.54	-75.67	CO	10
Santa Catarina	25.67	-100.46	MX	10
Sumbawanga	-7.97	31.62	TZ	10
Orël	52.97	36.08	RU	10
Akashi	34.66	135.01	JP	10
Hai Bà Trưng	21.01	105.85	VN	10
Kurume	33.32	130.52	JP	10
Graz	47.07	15.44	AT	10
Saint Paul	44.94	-93.09	US	10
Nghi Sơn	19.33	105.82	VN	10
Karnāl	29.69	76.98	IN	10
Changyi	36.85	119.39	CN	10
Ciudad del Este	-25.50	-54.65	PY	10
Rosetta	31.40	30.42	EG	10
Barddhamān	23.26	87.86	IN	10
Kediri	-7.82	112.02	ID	10
Solwezi	-12.17	26.39	ZM	10
Augsburg	48.37	10.90	DE	10
Valladolid	41.66	-4.72	ES	10
Miri	4.40	113.99	MY	10
Xinyi	34.38	118.35	CN	10
Mardan	34.20	72.05	PK	10
Surgut	61.26	73.42	RU	10
Swansea	51.62	-3.94	GB	10
San Pablo	14.07	121.33	PH	10
Newcastle upon Tyne	54.97	-1.61	GB	10
Gundupālaiyam	11.94	79.80	IN	10
Várzea Grande	-15.65	-56.13	BR	10
Gatineau	45.48	-75.70	CA	10
Yangshuo	24.78	110.49	CN	10
Biñan	14.34	121.08	PH	10
Winejok	9.01	27.57	SS	10
Mérida	8.58	-71.17	VE	10
Linqu	36.52	118.54	CN	10
Uruapan	19.42	-102.06	MX	10
Pātan	27.68	85.31	NP	10
Fergana	40.38	71.78	UZ	10
Bahía Blanca	-38.72	-62.27	AR	10
Santol	15.16	120.57	PH	10
Kaolack	14.15	-16.07	SN	10
Jember	-8.17	113.70	ID	10
Aomori	40.82	140.73	JP	10
Bārāsat	22.72	88.48	IN	10
Mulugu	18.19	79.94	IN	10
Foz do Iguaçu	-25.55	-54.59	BR	10
Bihār Sharīf	25.20	85.52	IN	10
Tegal	-6.87	109.14	ID	10
Grozny	43.31	45.69	RU	10
Boma	-5.85	13.05	CD	10
Bāli	22.65	88.34	IN	10
Pu'er	22.79	100.97	CN	10
Rāmpur	28.81	79.03	IN	10
Darbhanga	26.15	85.90	IN	10
Panipat	29.39	76.97	IN	10
Mwene	-9.82	22.87	CD	10
Białystok	53.13	23.16	PL	10
São José	-27.62	-48.63	BR	10
Rufisque	14.72	-17.27	SN	10
Murmansk	68.97	33.10	RU	10
Tirupati	13.64	79.42	IN	10
Southend-on-Sea	51.54	0.71	GB	10
Petrópolis	-22.50	-43.18	BR	10
Guarujá	-23.99	-46.26	BR	10
Itajaí	-26.91	-48.66	BR	10
Lincoln	40.80	-96.67	US	10
Phu Quoc	10.22	103.97	VN	10
Baiyin	36.55	104.17	CN	10
Fukushima	37.75	140.47	JP	10
Bergen	60.39	5.32	NO	10
Greater Noida	28.50	77.54	IN	10
Noida	28.58	77.33	IN	10
Tambov	52.74	41.44	RU	10
Vigo	42.23	-8.72	ES	10
Aizawl	23.73	92.72	IN	10
Banjarbaru	-3.44	114.84	ID	10
Thanh Xuân	20.99	105.80	VN	10
Al Hufūf	25.36	49.59	SA	10
Cholula	19.06	-98.30	MX	10
Gandhinagar	23.22	72.68	IN	10
Semey	50.42	80.25	KZ	10
Cầu Giấy	21.03	105.80	VN	10
Dindigul	10.37	77.98	IN	10
Ponta Grossa	-25.09	-50.16	BR	10
Gaozhou	21.92	110.86	CN	10
Kamoke	31.98	74.22	PK	10
Limeira	-22.56	-47.40	BR	10
Thanjavur	10.79	79.14	IN	10
Kariega	-33.76	25.40	ZA	10
Adıyaman	37.76	38.28	TR	10
Al Mubarraz	25.41	49.59	SA	10
Resistencia	-27.46	-58.99	AR	10
Morioka	39.70	141.15	JP	10
Atyrau	47.10	51.88	KZ	10
Xiuying	20.00	110.29	CN	10
San Cristóbal	7.77	-72.24	VE	10
Cileungsir	-6.39	106.96	ID	10
Karīmnagar	18.44	79.13	IN	10
Victoria	48.44	-123.35	CA	10
Anchorage	61.22	-149.90	US	10
Dewas	22.97	76.06	IN	10
Batna	35.56	6.17	DZ	10
Kaunas	54.90	23.91	LT	10
Sonīpat	28.99	77.02	IN	10
Machala	-3.26	-79.96	EC	10
Wiesbaden	50.09	8.24	DE	10
Meads	38.41	-82.71	US	10
Kabwe	-14.45	28.45	ZM	10
Sinŭiju	40.10	124.40	KP	10
Ibaraki	34.82	135.57	JP	10
Bắc Ninh	21.19	106.08	VN	10
Ichalkaranji	16.69	74.46	IN	10
Phú Mỹ	10.63	107.07	VN	10
Ceilândia	-15.81	-48.13	BR	10
Katowice	50.26	19.02	PL	10
Adapazarı	40.78	30.40	TR	10
Cluj-Napoca	46.77	23.60	RO	10
Gunpo	37.37	126.95	KR	10
Songea	-10.68	35.65	TZ	10
Butembo	0.14	29.29	CD	10
Tacna	-18.01	-70.25	PE	10
Tin Shui Wai	22.46	114.00	HK	10
Long Xuyên	10.39	105.44	VN	10
Savar	23.85	90.25	BD	10
Bathinda	30.21	74.94	IN	10
Henderson	36.04	-114.98	US	10
Jālna	19.84	75.89	IN	10
Sekondi	4.93	-1.71	GH	10
Kyengera	0.30	32.50	UG	10
Greensboro	36.07	-79.79	US	10
Haifa	32.81	35.00	IL	10
Århus	56.16	10.21	DK	10
Dengzhou	32.68	112.09	CN	10
Artux	39.71	76.18	CN	10
Chuncheon	37.87	127.73	KR	10
Alto Barinas	8.59	-70.23	VE	10
Mbour	14.42	-16.96	SN	10
Brighton	50.83	-0.14	GB	10
Karlsruhe	49.01	8.40	DE	10
Port Moresby	-9.48	147.15	PG	10
Minya	28.09	30.76	EG	10
Plano	33.02	-96.70	US	10
Marabá	-5.38	-49.13	BR	10
Ichihara	35.52	140.08	JP	10
Qibao	31.15	121.36	CN	10
Kirāri Sulemānnagar	28.70	77.06	IN	10
Cainta	14.58	121.12	PH	10
Satna	24.58	80.83	IN	10
Geelong	-38.15	144.36	AU	10
Chernihiv	51.51	31.29	UA	10
Xinyuan	43.43	83.25	CN	10
Chapecó	-27.10	-52.62	BR	10
Ba Vì	21.08	105.38	VN	10
Valparaíso	-33.04	-71.63	CL	10
Ica	-14.08	-75.73	PE	10
Purnia	25.78	87.47	IN	10
Newark	40.74	-74.17	US	10
Itagüí	6.18	-75.60	CO	10
Nicolás Romero	19.64	-99.31	MX	10
Gebze	40.80	29.43	TR	10
Lichinga	-13.31	35.24	MZ	10
Narsingdi	23.92	90.72	BD	10
Zeytinburnu	40.99	28.90	TR	10
Sfax	34.74	10.76	TN	10
Zumpango	19.80	-99.10	MX	10
Merkezefendi	37.81	29.04	TR	10
Madison	43.07	-89.40	US	10
Bukhara	39.77	64.43	UZ	10
Wollongong	-34.42	150.89	AU	10
Volta Redonda	-22.52	-44.10	BR	10
Ostrava	49.83	18.28	CZ	10
St. Louis	38.63	-90.20	US	10
Poltava	49.59	34.55	UA	10
Sumaré	-22.82	-47.27	BR	10
Efon-Alaaye	7.66	4.92	NG	10
Binjai	3.60	98.49	ID	10
Pematangsiantar	2.96	99.07	ID	10
Petrozavodsk	61.78	34.35	RU	10
Enshi	30.30	109.48	CN	10
Taganrog	47.24	38.91	RU	10
Santa Teresa del Tuy	10.23	-66.66	VE	10
Quảng Ngãi	15.12	108.79	VN	10
Qarshi	38.86	65.79	UZ	10
Tanghe	32.69	112.83	CN	10
Coacalco	19.63	-99.11	MX	10
Sincelejo	9.30	-75.39	CO	10
Zoucheng	35.40	116.97	CN	10
Khomeynī Shahr	32.69	51.54	IR	10
Kostroma	57.77	40.93	RU	10
Imphal	24.81	93.94	IN	10
Gagnoa	6.13	-5.95	CI	10
Ulu Bedok	1.33	103.93	SG	10
Bedok New Town	1.33	103.94	SG	10
Owo	7.20	5.59	NG	10
Suncheon	34.95	127.49	KR	10
Fangchenggang	21.77	108.36	CN	10
Komsomolsk-on-Amur	50.55	137.01	RU	10
Abbottabad	34.15	73.21	PK	10
Kaili	26.59	107.98	CN	10
Hakodate	41.78	140.74	JP	10
Yamoussoukro	6.82	-5.28	CI	10
Bab Ezzouar	36.73	3.18	DZ	10
Strasbourg	48.58	7.75	FR	10
Saugor	23.84	78.74	IN	10
Neihu	25.08	121.59	TW	10
Tsu	34.73	136.52	JP	10
Xingning	24.15	115.72	CN	10
Linxia Chengguanzhen	35.60	103.21	CN	10
Khmelnytskyi	49.42	26.98	UA	10
Kushinagar	26.74	83.89	IN	10
Saddiqabad	28.31	70.13	PK	10
Loja	-3.99	-79.20	EC	10
Tai Po	22.45	114.17	HK	10
Isfara	40.13	70.63	TJ	10
Luena	-11.78	19.92	AO	10
Taboão da Serra	-23.63	-46.79	BR	10
Istaravshan	39.91	69.00	TJ	10
Turpan	42.95	89.18	CN	10
Rourkela	22.22	84.86	IN	10
Yao	34.62	135.60	JP	10
Banī Suwayf	29.07	31.10	EG	10
Imperatriz	-5.53	-47.49	BR	10
Nagar Naluākot	24.16	90.77	BD	10
Guantánamo	20.14	-75.21	CU	10
Baguio	16.42	120.59	PH	10
Ar Rayyān	25.29	51.42	QA	10
Polokwane	-23.90	29.47	ZA	10
Ljubljana	46.05	14.51	SI	10
Jalālābād	34.43	70.45	AF	10
Deir ez-Zor	35.34	40.14	SY	10
Gijón	43.54	-5.66	ES	10
Santa Maria	-29.68	-53.81	BR	10
Parnamirim	-5.92	-35.26	BR	10
Hafar Al-Batin	28.43	45.97	SA	10
Kakogawachō-honmachi	34.77	134.83	JP	10
Quận Sáu	10.75	106.65	VN	10
Mỹ Tho	10.36	106.36	VN	10
Mito	36.35	140.45	JP	10
Derby	52.92	-1.48	GB	10
Dessie	11.13	39.63	ET	10
Hạ Long	20.95	107.07	VN	10
Gelsenkirchen	51.51	7.10	DE	10
Longling County	24.59	98.69	CN	10
Cherkasy	49.44	32.06	UA	10
Malolos	14.84	120.81	PH	10
Southampton	50.90	-1.40	GB	10
Kapar	3.13	101.38	MY	10
Çorum	40.55	34.95	TR	10
Ghulja	43.92	81.32	CN	10
Merlo	-34.67	-58.73	AR	10
Yeosu	34.76	127.66	KR	10
Durg	21.19	81.28	IN	10
Fuling	29.71	107.39	CN	10
Mokpo	34.81	126.39	KR	10
Birgañj	27.02	84.88	NP	10
Yoshkar-Ola	56.64	47.89	RU	10
Russeifa	32.02	36.05	JO	10
Banda Aceh	5.54	95.33	ID	10
Shibīn al Kawm	30.55	31.01	EG	10
Mirpur Khas	25.53	69.01	PK	10
Sengkang New Town	1.39	103.89	SG	10
Floridablanca	7.06	-73.09	CO	10
Tokushima	34.07	134.57	JP	10
Sterlitamak	53.64	55.95	RU	10
Anantapur	14.68	77.61	IN	10
Gyeongsan-si	35.82	128.74	KR	10
Sohag	26.56	31.69	EG	10
Nagaoka	37.45	138.85	JP	10
Saint-Marc	19.11	-72.70	HT	10
Governador Valadares	-18.85	-41.95	BR	10
São Carlos	-22.02	-47.89	BR	10
Bagerhat	22.66	89.79	BD	10
Hà Tĩnh	18.34	105.91	VN	10
Saskatoon	52.13	-106.67	CA	10
Chengzhong	30.94	113.55	CN	10
Djelfa	34.67	3.26	DZ	10
Chula Vista	32.64	-117.08	US	10
Shimonoseki	33.96	130.94	JP	10
Toledo	41.66	-83.56	US	10
Kibaha	-6.77	38.92	TZ	10
Hulan Ergi	47.20	123.63	CN	10
Bordeaux	44.84	-0.58	FR	10
Aachen	50.78	6.08	DE	10
Gent	51.05	3.72	BE	10
Gravataí	-29.94	-50.99	BR	10
Mantampay	8.17	124.22	PH	10
Ratlām	23.33	75.04	IN	10
Nogales	31.31	-110.94	MX	10
El Daein	11.46	26.13	SD	10
Donghai	22.95	115.64	CN	10
Dezful	32.38	48.41	IR	10
Gunsan	35.98	126.71	KR	10
Mossoró	-5.19	-37.34	BR	10
Macaé	-22.38	-41.78	BR	10
Rānipet	12.92	79.33	IN	10
Brāhmanbāria	23.97	91.11	BD	10
Porto-Novo	6.50	2.60	BJ	10
Chernivtsi	48.29	25.93	UA	10
Jersey City	40.73	-74.08	US	10
Manta	-0.95	-80.73	EC	10
Reno	39.53	-119.81	US	10
Bégoua	4.45	18.53	CF	10
Riobamba	-1.67	-78.66	EC	10
Sivas	39.75	37.02	TR	10
Dourados	-22.22	-54.81	BR	10
Rondonópolis	-16.47	-54.64	BR	10
Wolverhampton	52.59	-2.12	GB	10
Pasarkemis	-6.17	106.53	ID	10
Fanling	22.49	114.14	HK	10
Chiayi City	23.48	120.45	TW	10
Dongtai	32.85	120.31	CN	10
Fuchū	35.67	139.48	JP	10
Jurong Town	1.33	103.72	SG	10
Marāgheh	37.39	46.24	IR	10
Quilmes	-34.72	-58.25	AR	10
Fukui-shi	36.06	136.22	JP	10
Lal Bahadur Nagar	17.35	78.56	IN	10
Mönchengladbach	51.19	6.44	DE	10
Bagong Silang	14.78	121.04	PH	10
Zhytomyr	50.26	28.68	UA	10
Karamay	45.58	84.89	CN	10
Arrah	25.56	84.66	IN	10
Tongliao	43.61	122.27	CN	10
Bariadi	-2.80	33.98	TZ	10
Antsirabe	-19.87	47.03	MG	10
Chandler	33.31	-111.84	US	10
Yei	4.09	30.68	SS	10
Tampere	61.50	23.79	FI	10
Mahajanga	-15.72	46.32	MG	10
Minato City	35.66	139.75	JP	10
Fort Wayne	41.13	-85.13	US	10
Plymouth	50.37	-4.14	GB	10
Nianbo	36.48	102.42	CN	10
Skardu	35.30	75.63	PK	10
Marawi City	8.00	124.28	PH	10
Embu das Artes	-23.65	-46.85	BR	10
Qo‘qon	40.53	70.94	UZ	10
Tacloban	11.24	125.00	PH	10
São José de Ribamar	-2.56	-44.06	BR	10
Changle	36.71	118.83	CN	10
Gajuwaka	17.70	83.22	IN	10
Rishon LeTsiyyon	31.97	34.79	IL	10
Hiratsuka	35.33	139.34	JP	10
Stoke-on-Trent	53.00	-2.19	GB	10
Buffalo	42.89	-78.88	US	10
Verona	45.44	10.99	IT	10
Ðà Lạt	11.95	108.44	VN	10
San Salvador de Jujuy	-24.19	-65.29	AR	10
Durham	35.99	-78.90	US	10
Etāwah	26.78	79.02	IN	10
Gasteiz / Vitoria	42.85	-2.67	ES	10
Rugao	32.37	120.58	CN	10
Gómez Palacio	25.57	-103.50	MX	10
St. Petersburg	27.77	-82.68	US	10
L'Hospitalet de Llobregat	41.36	2.10	ES	10
Gdynia	54.52	18.53	PL	10
Cilacap	-7.73	109.01	ID	10
Irvine	33.67	-117.82	US	10
Kitchener	43.43	-80.51	CA	10
Suicheng	33.90	117.93	CN	10
Nada	19.52	109.58	CN	10
Los Mochis	25.79	-109.00	MX	10
Bratsk	56.13	101.61	RU	10
Pachuca de Soto	20.12	-98.73	MX	10
Chingola	-12.53	27.88	ZM	10
Sumy	50.92	34.80	UA	10
Milton Keynes	52.04	-0.76	GB	10
Indaiatuba	-23.09	-47.21	BR	10
Laredo	27.51	-99.51	US	10
Juazeiro	-9.41	-40.50	BR	10
Vila Flor	-8.98	13.31	AO	10
Germiston	-26.23	28.18	ZA	10
Parakou	9.34	2.63	BJ	10
Isiro	2.77	27.62	CD	10
Sari	36.56	53.06	IR	10
Tarakan	3.31	117.59	ID	10
Kenema	7.88	-11.19	SL	10
Oaxaca	17.06	-96.73	MX	10
Mossamedes	-15.20	12.15	AO	10
Al Madīnah	30.96	47.27	IQ	10
Hobart	-42.88	147.33	AU	10
Ikot Ekpene	5.18	7.71	NG	10
Yanzhou	35.55	116.83	CN	10
Woodlands	1.44	103.79	SG	10
Hanam	37.54	127.21	KR	10
Mueang Nonthaburi	13.86	100.51	TH	10
Muridke	31.80	74.26	PK	10
Saint-Louis	16.02	-16.49	SN	10
Batu Caves	3.24	101.68	MY	10
Novo Hamburgo	-29.68	-51.13	BR	10
Jurong West	1.35	103.72	SG	10
Singkawang	0.91	108.98	ID	10
Cox’s Bāzār	21.44	92.01	BD	10
Cotia	-23.60	-46.92	BR	10
Petaẖ Tiqva	32.09	34.89	IL	10
Marg‘ilon	40.47	71.72	UZ	10
Ambarnath	19.20	73.17	IN	10
Godomè	6.39	2.35	BJ	10
Naihāti	22.89	88.42	IN	10
Braşov	45.65	25.61	RO	10
Xuân Lộc	10.93	107.23	VN	10
Laohekou	32.39	111.67	CN	10
Richards Bay	-28.78	32.04	ZA	10
Qina	26.16	32.73	EG	10
Bharatpur	27.22	77.49	IN	10
Vantaa	60.29	25.04	FI	10
Porto	41.15	-8.61	PT	10
Kiel	54.32	10.13	DE	10
El Fasher	13.63	25.35	SD	10
Thiès Nones	14.78	-16.97	SN	10
Suihua	46.65	126.97	CN	10
Los Teques	10.35	-67.04	VE	10
Santiago del Estero	-27.80	-64.26	AR	10
Sétif	36.19	5.41	DZ	10
Begusarai	25.42	86.13	IN	10
Borūjerd	33.90	48.75	IR	10
Qarchak	35.43	51.58	IR	10
Afyonkarahisar	38.76	30.54	TR	10
İskenderun	36.59	36.17	TR	10
Maracanaú	-3.88	-38.63	BR	10
Ota	6.69	3.23	NG	10
Thika	-1.03	37.07	KE	10
San Fernando	15.03	120.68	PH	10
Menongue	-14.66	17.69	AO	10
Jacareí	-23.31	-45.97	BR	10
Jimma	7.67	36.83	ET	10
Timişoara	45.75	21.23	RO	10
Santa Clara	22.41	-79.97	CU	10
Iwo	7.64	4.18	NG	10
A Coruña	43.37	-8.40	ES	10
Libertad	8.94	125.50	PH	10
La Paz	24.14	-110.31	MX	10
Kelar	34.63	45.32	IQ	10
Niš	43.32	21.90	RS	10
Singa	13.15	33.93	SD	10
San Bernardo	-33.59	-70.70	CL	10
Sōka	35.84	139.80	JP	10
Mzuzu	-11.47	34.02	MW	10
Navotas	14.67	120.95	PH	10
Tiruvottiyūr	13.16	80.30	IN	10
Burnaby	49.27	-122.95	CA	10
Lubbock	33.58	-101.86	US	10
Thị Trấn Đông Triều	21.08	106.51	VN	10
Yamagata	38.23	140.37	JP	10
Tehuacán	18.46	-97.40	MX	10
Guarenas	10.47	-66.62	VE	10
Montpellier	43.61	3.88	FR	10
Jimeta	9.28	12.46	NG	10
Częstochowa	50.80	19.12	PL	10
Gāndhīdhām	23.08	70.13	IN	10
Beibei	29.83	106.44	CN	10
Insein	16.89	96.10	MM	10
City of Westminster	51.50	-0.14	GB	10
Gilbert	33.35	-111.79	US	10
Chemnitz	50.84	12.93	DE	10
Paraná	-31.73	-60.53	AR	10
San Miguel	13.48	-88.18	SV	10
Shijie	23.10	113.79	CN	10
Chitato	-7.30	20.73	AO	10
Orsk	51.23	58.49	RU	10
Vanderbijlpark	-26.71	27.84	ZA	10
Coro	11.41	-69.68	VE	10
Americana	-22.74	-47.33	BR	10
Hami	42.83	93.51	CN	10
Gaborone	-24.65	25.91	BW	10
Al ‘Āshir min Ramaḑān	30.30	31.75	EG	10
Mau	25.94	83.56	IN	10
Puerto Montt	-41.47	-72.94	CL	10
Northampton	52.25	-0.88	GB	10
Juliaca	-15.50	-70.13	PE	10
Fuji	35.17	138.68	JP	10
Gyeongju	35.84	129.21	KR	10
Águas Lindas de Goiás	-15.76	-48.28	BR	10
Sinfra	6.62	-5.91	CI	10
Syktyvkar	61.66	50.82	RU	10
Gorgān	36.84	54.44	IR	10
Nizhnevartovsk	60.93	76.55	RU	10
Shahkot	31.57	73.49	PK	10
Groningen	53.22	6.57	NL	10
Biratnagar	26.46	87.27	NP	10
Braunschweig	52.27	10.53	DE	10
Valera	9.32	-70.60	VE	10
Sīkar	27.61	75.14	IN	10
Bago	17.34	96.48	MM	10
Magdeburg	52.13	11.63	DE	10
Baruta	10.43	-66.88	VE	10
Magé	-22.65	-43.04	BR	10
Trabzon	41.01	39.73	TR	10
Tri-Cities	46.25	-119.20	US	10
Jessore	23.17	89.21	BD	10
Manisa	38.61	27.43	TR	10
Arapiraca	-9.75	-36.66	BR	10
Rivne	50.62	26.24	UA	10
Padangsidempuan	1.38	99.27	ID	10
Probolinggo	-7.75	113.22	ID	10
Sabzevar	36.21	57.68	IR	10
Musaffah	24.36	54.48	AE	10
Sasebo	33.17	129.73	JP	10
Angarsk	52.56	103.91	RU	10
Ramagundam	18.75	79.47	IN	10
Hāpur	28.73	77.78	IN	10
Chigasaki	35.34	139.40	JP	10
Toli-Toli	1.04	120.82	ID	10
Chōfu	35.66	139.55	JP	10
Huayin	34.57	110.07	CN	10
Berbera	10.44	45.01	SO	10
Jiyuan	35.09	112.59	CN	10
Yamato	35.47	139.45	JP	10
Man	7.41	-7.55	CI	10
Bahawalnagar	30.00	73.25	PK	10
Novorossiysk	44.73	37.76	RU	10
Tsukuba	36.08	140.12	JP	10
Arica	-18.48	-70.30	CL	10
Peñalolén	-33.47	-70.53	CL	10
Rio Verde	-17.80	-50.93	BR	10
Hải Dương	20.94	106.33	VN	10
Winston-Salem	36.10	-80.24	US	10
Farrukhābād	27.39	79.58	IN	10
Matsumoto	36.23	137.97	JP	10
Alappuzha	9.49	76.33	IN	10
Itapevi	-23.55	-46.93	BR	10
Katihar	25.54	87.57	IN	10
Ciudad Ojeda	10.20	-71.31	VE	10
Gucun	31.35	121.39	CN	10
Glendale	33.54	-112.19	US	10
Navegantes	-12.59	13.39	AO	10
Itaboraí	-22.74	-42.86	BR	10
Klang	3.04	101.44	MY	10
Golestān	35.52	51.18	IR	10
Khimki	55.90	37.43	RU	10
Horlivka	48.30	38.02	UA	10
Nacala	-14.56	40.69	MZ	10
Xiantao	30.37	113.44	CN	10
Nalchik	43.50	43.62	RU	10
Hachinohe	40.50	141.50	JP	10
Sete Lagoas	-19.47	-44.25	BR	10
Osan	37.15	127.07	KR	10
Lille	50.63	3.06	FR	10
Neyagawa	34.77	135.63	JP	10
Ormoc	11.01	124.61	PH	10
Magdalena Contreras	19.33	-99.21	MX	10
Nāgarpur	24.06	89.88	BD	10
Kasulu	-4.58	30.10	TZ	10
Ngaoundéré	7.33	13.58	CM	10
Ivano-Frankivsk	48.92	24.71	UA	10
Cabo Frio	-22.89	-42.03	BR	10
Balıkesir	39.65	27.89	TR	10
Temuco	-38.74	-72.60	CL	10
Norfolk	36.85	-76.29	US	10
Krefeld	51.34	6.55	DE	10
Halle (Saale)	51.48	11.98	DE	10
Sri Ganganagar	29.92	73.87	IN	10
Marília	-22.21	-49.95	BR	10
Amarapura	21.91	96.05	MM	10
Kilamba	-8.85	13.28	AO	10
Āmol	36.47	52.35	IR	10
Freiburg	48.00	7.85	DE	10
Batangas	13.76	121.06	PH	10
Al Jubayl	27.02	49.62	SA	10
Tŏkch’ŏn	39.75	126.26	KP	10
Oldham	53.54	-2.12	GB	10
Pathein	16.78	94.73	MM	10
Hialeah	25.86	-80.28	US	10
Kunri	25.18	69.57	PK	10
Sylhet	24.90	91.87	BD	10
Paarl	-33.73	18.98	ZA	10
Garland	32.91	-96.64	US	10
Podgorica	42.44	19.26	ME	10
Scottsdale	33.51	-111.90	US	10
Hortolândia	-22.86	-47.22	BR	10
Irving	32.81	-96.95	US	10
Centurion	-25.86	28.19	ZA	10
Qingzhou	36.70	118.48	CN	10
Pākdasht	35.48	51.68	IR	10
Kajang	2.99	101.79	MY	10
Eindhoven	51.44	5.48	NL	10
Boise	43.61	-116.20	US	10
Rewa	24.53	81.29	IN	10
Yakutsk	62.03	129.72	RU	10
Bole	44.89	82.07	CN	10
Muzaffargarh	30.07	71.19	PK	10
Chesapeake	36.82	-76.27	US	10
Uluberiya	22.48	88.10	IN	10
Ipatinga	-19.47	-42.54	BR	10
Dali	25.58	100.21	CN	10
Najafābād	32.63	51.37	IR	10
Thành Phố Bà Rịa	10.50	107.17	VN	10
Georgetown	6.80	-58.16	GY	10
Kismayo	-0.36	42.55	SO	10
North Las Vegas	36.20	-115.12	US	10
Elche	38.26	-0.70	ES	10
Presidente Prudente	-22.13	-51.39	BR	10
Sivakasi	9.45	77.80	IN	10
Kindu	-2.94	25.92	CD	10
Digri	25.16	69.11	PK	10
Nizhnekamsk	55.64	51.82	RU	10
Karur	10.96	78.08	IN	10
Lubuklinggau	-3.29	102.86	ID	10
Craiova	44.32	23.80	RO	10
Rāichūr	16.21	77.36	IN	10
Pallāvaram	12.97	80.15	IN	10
Danlí	14.03	-86.58	HN	10
Yongkang	23.02	120.26	TW	10
Bo	7.96	-11.74	SL	10
Granada	37.19	-3.61	ES	10
Ooty	11.41	76.70	IN	10
Saga	33.23	130.30	JP	10
Magugpo Poblacion	7.45	125.80	PH	10
Dzerzhinsk	56.24	43.46	RU	10
Pemba	-12.97	40.52	MZ	10
Geoje	34.81	128.71	KR	10
Teluk Intan	4.02	101.02	MY	10
Singida	-4.82	34.74	TZ	10
Kigoma	-4.88	29.63	TZ	10
Colombo	-25.29	-49.22	BR	10
Fremont	37.55	-121.99	US	10
Viamão	-30.08	-51.02	BR	10
Jiayuguan	39.81	98.29	CN	10
Abadan	30.34	48.30	IR	10
Taytay	14.56	121.13	PH	10
Phổ Yên	21.42	105.89	VN	10
Neuquén	-38.95	-68.06	AR	10
Divinópolis	-20.14	-44.89	BR	10
Türkmenabat	39.07	63.58	TM	10
Sơn Tây	21.14	105.51	VN	10
Ninh Hòa	12.49	109.12	VN	10
Pasir Mas	6.05	102.14	MY	10
Purwokerto	-7.42	109.23	ID	10
José C. Paz	-34.52	-58.77	AR	10
Marka	1.72	44.77	SO	10
Pāli	25.77	73.32	IN	10
Ḩalwān	29.84	31.30	EG	10
Atani	6.01	6.75	NG	10
Mariupol	47.10	37.54	UA	10
Changzheng	31.24	121.37	CN	10
Kasukabe	35.98	139.75	JP	10
Paris 15 Vaugirard	48.84	2.30	FR	10
Windsor	42.30	-83.02	CA	10
Hosūr	12.74	77.83	IN	10
Spokane	47.66	-117.43	US	10
Tripoli	34.43	35.84	LB	10
Longueuil	45.52	-73.47	CA	10
Ordu	40.98	37.89	TR	10
San Fernando de Apure	7.89	-67.47	VE	10
Croix-des-Bouquets	18.58	-72.23	HT	10
Lucena	13.93	121.62	PH	10
Yishun New Town	1.43	103.83	SG	10
Vizianagaram	18.12	83.41	IN	10
Jinchang	38.50	102.19	CN	10
Phan Thiết	10.93	108.10	VN	10
Şabyā	17.15	42.63	SA	10
Netanya	32.33	34.86	IL	10
Ciudad Lineal	40.45	-3.65	ES	10
Meycauayan	14.74	120.96	PH	10
Bexley	51.44	0.15	GB	10
Aliayabiagba	6.45	3.33	NG	10
Nassau	25.06	-77.34	BS	10
San Lorenzo	-25.34	-57.51	PY	10
Rennes	48.11	-1.67	FR	10
Mohammedia	33.69	-7.38	MA	10
Guatire	10.47	-66.54	VE	10
Tanjung Pinang	0.92	104.46	ID	10
Baton Rouge	30.44	-91.19	US	10
Criciúma	-28.68	-49.37	BR	10
Sosnowiec	50.29	19.10	PL	10
Turkistan	43.29	68.26	KZ	10
Klerksdorp	-26.85	26.67	ZA	10
Staryy Oskol	51.30	37.85	RU	10
Ageo	35.97	139.61	JP	10
Gusau	12.17	6.66	NG	10
Kamyanske	48.52	34.61	UA	10
Ashdod	31.79	34.65	IL	10
Radom	51.40	21.15	PL	10
Paya Terubong	5.37	100.28	MY	10
Richmond	37.55	-77.46	US	10
Chang-hua	24.07	120.56	TW	10
Changhua	24.07	120.55	TW	10
Điện Bàn	15.89	108.25	VN	10
Takarazuka	34.80	135.36	JP	10
Nzérékoré	7.76	-8.82	GN	10
Regina	50.45	-104.62	CA	10
Cà Mau	9.18	105.15	VN	10
Shrīrāmpur	22.75	88.34	IN	10
Pangkalpinang	-2.13	106.11	ID	10
Quthbullapur	17.50	78.46	IN	10
Mubi	10.27	13.27	NG	10
Varāmīn	35.32	51.65	IR	10
Batu	-7.87	112.53	ID	10
Somerset West	-34.08	18.82	ZA	10
Luton	51.88	-0.42	GB	10
Ternopil	49.55	25.59	UA	10
Bitung	1.44	125.13	ID	10
Mymensingh	24.76	90.41	BD	10
Blagoveshchensk	50.28	127.53	RU	10
Nadiād	22.69	72.86	IN	10
Kumba	4.64	9.45	CM	10
Košice	48.71	21.26	SK	10
Kremenchuk	49.06	33.40	UA	10
Jingling	30.65	113.10	CN	10
Nāgercoil	8.18	77.43	IN	10
Sucre	-19.03	-65.26	BO	10
Mutare	-18.97	32.67	ZW	10
Puerto Vallarta	20.62	-105.23	MX	10
Minamirinkan	35.50	139.44	JP	10
Cork	51.90	-8.47	IE	10
Atsugi	35.44	139.37	JP	10
Heihe	50.24	127.49	CN	10
Mango	22.83	86.22	IN	10
Sinop	-11.86	-55.50	BR	10
Paramaribo	5.87	-55.17	SR	10
Klungkung	-8.53	115.40	ID	10
Narayanganj	23.61	90.50	BD	10
NIA Valencia	7.91	125.09	PH	10
Tongchuanshi	35.07	109.08	CN	10
Concepción	-36.83	-73.05	CL	10
Ramadi	33.42	43.31	IQ	10
Paradise	36.10	-115.15	US	10
Tacoma	47.25	-122.44	US	10
Mainz	49.98	8.28	DE	10
Velikiy Novgorod	58.52	31.27	RU	10
Sungai Buloh	3.21	101.56	MY	10
Puerto Princesa	9.74	118.74	PH	10
Palhoça	-27.65	-48.67	BR	10
Xintai	35.90	117.75	CN	10
El Tigre	8.89	-64.25	VE	10
Haeju	38.04	125.71	KP	10
Formosa	-26.18	-58.17	AR	10
Ikire	7.37	4.19	NG	10
La Ceiba	15.76	-86.78	HN	10
Tilburg	51.56	5.09	NL	10
Ba Dinh	21.04	105.83	VN	10
Murwāra	23.84	80.39	IN	10
Moshi	-3.35	37.33	TZ	10
Kanchipuram	12.84	79.70	IN	10
Sousse	35.83	10.64	TN	10
Tuluá	4.08	-76.20	CO	10
Soyo	-6.13	12.37	AO	10
Sóc Trăng	9.60	105.97	VN	10
Kankan	10.39	-9.31	GN	10
Shakhty	47.72	40.22	RU	10
Mbarara	-0.60	30.65	UG	10
Luziânia	-16.25	-47.95	BR	10
Olongapo	14.83	120.28	PH	10
Ibarra	0.35	-78.12	EC	10
Banja Luka	44.78	17.21	BA	10
Neyshābūr	36.21	58.80	IR	10
Sāveh	35.02	50.36	IR	10
Wuxue	29.85	115.55	CN	10
Chí Linh	21.07	106.32	VN	10
Campeche	19.84	-90.52	MX	10
Quận Ba	10.77	106.69	VN	10
Singrauli	24.20	82.68	IN	10
Mirzāpur	25.14	82.57	IN	10
Oviedo	43.36	-5.84	ES	10
Bandar Seri Alam	1.50	103.88	MY	10
Sorong	-0.88	131.26	ID	10
Messina	38.19	15.55	IT	10
Dehiwala-Mount Lavinia	6.84	79.87	LK	10
Kropyvnytskyi	48.51	32.27	UA	10
Kharagpur	22.34	87.33	IN	10
Kabinda	-6.14	24.48	CD	10
Jacobabad	28.28	68.44	PK	10
Tunduma	-9.30	32.77	TZ	10
Binangonan	14.46	121.19	PH	10
Oberhausen	51.48	6.86	DE	10
Chon Buri	13.36	100.98	TH	10
Santa Luzia	-19.77	-43.85	BR	10
Prokop’yevsk	53.92	86.72	RU	10
Samambaia	-15.88	-48.10	BR	10
Erfurt	50.98	11.04	DE	10
Esmeraldas	0.96	-79.65	EC	10
Terrassa	41.57	2.02	ES	10
Barking	51.53	0.08	GB	10
Wuhai	39.68	106.82	CN	10
Valparaíso de Goiás	-16.07	-47.98	BR	10
Khuzdar	27.81	66.61	PK	10
Koutiala	12.39	-5.47	ML	10
Eluru	16.71	81.10	IN	10
San Pedro de Macorís	18.45	-69.31	DO	10
Galaţi	45.44	28.05	RO	10
Badalona	41.45	2.25	ES	10
Mokotów	52.19	21.03	PL	10
Taiping	4.85	100.73	MY	10
Yintai	35.12	109.10	CN	10
Yamuna Nagar	30.13	77.28	IN	10
Cabo de Santo Agostinho	-8.29	-35.03	BR	10
Buenavista	19.61	-99.17	MX	10
Gilgit	35.92	74.31	PK	10
Rybinsk	58.05	38.84	RU	10
Santa Rosa	14.31	121.11	PH	10
Sobral	-3.69	-40.35	BR	10
Trondheim	63.43	10.40	NO	10
Raurkela Industrial Township	22.20	84.86	IN	10
Porlamar	10.96	-63.87	VE	10
San Bernardino	34.11	-117.29	US	10
Ciudad Acuña	29.32	-100.95	MX	10
Oulu	65.01	25.47	FI	10
Bidar	17.91	77.52	IN	10
Lutsk	50.76	25.35	UA	10
San Cristóbal de las Casas	16.73	-92.64	MX	10
Zelenograd	55.98	37.18	RU	10
Archway	51.57	-0.13	GB	10
Wangsa Maju	3.20	101.74	MY	10
Salt Lake City	40.76	-111.89	US	10
Biysk	52.53	85.20	RU	10
Novi Sad	45.25	19.84	RS	10
Jiutepec	18.88	-99.18	MX	10
Longgang	22.72	114.26	CN	10
Monclova	26.91	-101.42	MX	10
Tân An	10.54	106.41	VN	10
Ma On Shan	22.41	114.24	HK	10
Commonwealth	14.70	121.08	PH	10
Huntsville	34.73	-86.59	US	10
Ziguinchor	12.57	-16.27	SN	10
Passo Fundo	-28.26	-52.41	BR	10
Kŭlob	37.91	69.78	TJ	10
Citeureup	-6.49	106.88	ID	10
Sa Dec	10.29	105.76	VN	10
Kure	34.23	132.57	JP	10
Shagamu	6.85	3.65	NG	10
Bnei Brak	32.08	34.83	IL	10
Khouribga	32.88	-6.91	MA	10
Yingtan	28.23	117.00	CN	10
Des Moines	41.60	-93.61	US	10
Çiğli	38.50	27.07	TR	10
Marcory	5.31	-3.99	CI	10
Gojra	31.15	72.68	PK	10
Cartagena	37.60	-0.98	ES	10
Quevedo	-1.03	-79.46	EC	10
Oakville	43.45	-79.68	CA	10
Pasuruan	-7.65	112.91	ID	10
Naz̧arābād	35.95	50.61	IR	10
Munger	25.37	86.47	IN	10
Jerez de la Frontera	36.69	-6.14	ES	10
El Jadida	33.26	-8.51	MA	10
Zitong	30.18	105.83	CN	10
Loa Janan	-0.58	117.10	ID	10
Târgu Mureş	46.54	24.56	RO	10
Fontana	34.09	-117.44	US	10
Rancagua	-34.17	-70.74	CL	10
Zhubei	24.84	121.01	TW	10
Mallawī	27.73	30.84	EG	10
Cape Coast	5.11	-1.25	GH	10
Bukit Mertajam	5.36	100.47	MY	10
Lipa City	13.94	121.16	PH	10
Lanús	-34.71	-58.39	AR	10
Lübeck	53.87	10.69	DE	10
Luojiang	31.30	104.50	CN	10
Sepang	2.69	101.75	MY	10
Cobán	15.47	-90.37	GT	10
Maricá	-22.92	-42.82	BR	10
Cao Lãnh	10.46	105.63	VN	10
Isesaki	36.32	139.20	JP	10
Sabadell	41.54	2.11	ES	10
Nandyāl	15.48	78.48	IN	10
Santa Cruz de Tenerife	28.47	-16.25	ES	10
Panchkula	30.69	76.85	IN	10
Modesto	37.64	-121.00	US	10
Panabo	7.31	125.68	PH	10
Lijiang	26.87	100.22	CN	10
Konibodom	40.29	70.43	TJ	10
Hailar	49.20	119.70	CN	10
Kabankalan	9.98	122.81	PH	10
Burhānpur	21.31	76.23	IN	10
Abha	18.22	42.51	SA	10
Ternate	0.79	127.38	ID	10
Burgas	42.51	27.47	BG	10
Pskov	57.82	28.33	RU	10
Morvi	22.82	70.84	IN	10
Daliang	22.84	113.25	CN	10
Quilicura	-33.37	-70.71	CL	10
Beni Mellal	32.34	-6.35	MA	10
Ashuganj City	24.04	91.01	BD	10
Sidi Bel Abbes	35.19	-0.63	DZ	10
Arroyo Naranjo	23.04	-82.38	CU	10
Jebel Ali	25.00	55.11	AE	10
Bogra	24.85	89.37	BD	10
Kostanay	53.21	63.62	KZ	10
Richmond	49.17	-123.14	CA	10
Rochester	43.15	-77.62	US	10
Banjar	-7.20	107.43	ID	10
Kanggye	40.97	126.59	KP	10
Chungju	36.98	127.93	KR	10
Anand	22.55	72.96	IN	10
São Leopoldo	-29.76	-51.15	BR	10
Bade	24.93	121.28	TW	10
Oruro	-17.97	-67.09	BO	10
Bachuan	29.85	106.05	CN	10
La Romana	18.42	-68.97	DO	10
Araçatuba	-21.21	-50.43	BR	10
Shashamane	7.20	38.60	ET	10
Hangu	39.25	117.79	CN	10
Ongole	15.50	80.04	IN	10
Pamplona	42.82	-1.64	ES	10
Gangneung	37.75	128.87	KR	10
Portsmouth	50.80	-1.09	GB	10
Gandajika	-6.75	23.95	CD	10
Gunan	29.02	106.65	CN	10
Phan Rang-Tháp Chàm	11.56	108.99	VN	10
Ciputat	-6.24	106.70	ID	10
Kasangati	0.44	32.60	UG	10
Bishoftu	8.75	38.98	ET	10
Nishi-Tokyo-shi	35.73	139.54	JP	10
Changam-ch’on	40.61	128.78	KP	10
Bila Tserkva	49.80	30.12	UA	10
Oxnard	34.20	-119.18	US	10
Ciampea	-6.55	106.70	ID	10
Hurghada	27.26	33.81	EG	10
Móstoles	40.32	-3.86	ES	10
Dosquebradas	4.84	-75.67	CO	10
Toledo	10.38	123.64	PH	10
Turku	60.45	22.27	FI	10
Worcester	42.26	-71.80	US	10
Pagadian	7.83	123.44	PH	10
San Felipe	10.34	-68.74	VE	10
Dinajpur	25.63	88.64	BD	10
Hosapete	15.27	76.39	IN	10
Việt Yên	21.27	106.13	VN	10
Ifakara	-8.13	36.68	TZ	10
Sumbe	-11.21	13.84	AO	10
Ségou	13.44	-6.26	ML	10
Kon Tum	14.35	108.01	VN	10
Latacunga	-0.93	-78.62	EC	10
Nāngloi Jāt	28.68	77.07	IN	10
Kishiwada	34.47	135.37	JP	10
Jinghong	22.00	100.77	CN	10
Mdantsane	-32.93	27.78	ZA	10
Bobruysk	53.15	29.21	BY	10
Gorontalo	0.54	123.06	ID	10
Qā’em Shahr	36.47	52.87	IR	10
Shikarpur	27.96	68.64	PK	10
Gongheyong	22.76	113.79	CN	10
Linz	48.31	14.29	AT	10
Dhangaḍhi̇̄	28.70	80.59	NP	10
Nanchuan	29.15	107.10	CN	10
Córdoba	18.88	-96.93	MX	10
Bishan	29.59	106.22	CN	10
Biskra	34.85	5.73	DZ	10
Xizhi	25.07	121.66	TW	10
Yanghang	31.37	121.44	CN	10
Gaoping	30.78	106.10	CN	10
Trieste	45.65	13.78	IT	10
Mpanda	-6.34	31.07	TZ	10
Moreno Valley	33.94	-117.23	US	10
Secunderabad	17.50	78.54	IN	10
Punggol	1.41	103.91	SG	10
Sodo	6.86	37.76	ET	10
Nossa Senhora do Socorro	-10.86	-37.13	BR	10
Zliten	32.47	14.57	LY	10
Padua	45.41	11.89	IT	10
Karnaphuli	22.69	92.23	BD	10
Las Tunas	20.96	-76.95	CU	10
Matsue	35.48	133.05	JP	10
Bayamón	18.40	-66.16	PR	10
Gimpo-si	37.62	126.71	KR	10
Lauro de Freitas	-12.89	-38.33	BR	10
Deoghar	24.49	86.70	IN	10
Fianarantsoa	-21.45	47.09	MG	10
Chāndpur	23.23	90.65	BD	10
Atsiaman	5.70	-0.33	GH	10
Bandundu Province	-3.32	17.38	CD	10
Osmaniye	37.07	36.25	TR	10
Bābol	36.55	52.68	IR	10
Cabo San Lucas	22.89	-109.91	MX	10
Little Rock	34.75	-92.29	US	10
Çorlu	41.16	27.80	TR	10
Madiun	-7.63	111.52	ID	10
Iringa	-7.77	35.70	TZ	10
Debrecen	47.53	21.62	HU	10
Chāpra	25.78	84.75	IN	10
Motijheel	23.73	90.42	BD	10
Barishal	22.70	90.37	BD	10
Richmond Hill	43.87	-79.44	CA	10
Fayetteville	35.05	-78.88	US	10
Al Khums	32.65	14.26	LY	10
Huntington Beach	33.66	-118.00	US	10
Koronadal	6.50	124.85	PH	10
Geneva	46.20	6.15	CH	10
Tallahassee	30.44	-84.28	US	10
Swindon	51.56	-1.78	GB	10
Rengasdengklok	-6.16	107.30	ID	10
Rio Claro	-22.41	-47.56	BR	10
Cajamarca	-7.16	-78.50	PE	10
Townsville	-19.27	146.81	AU	10
Thanh Khê	16.07	108.19	VN	10
La Pintana	-33.58	-70.63	CL	10
Daşoguz	41.84	59.97	TM	10
Yonkers	40.93	-73.90	US	10
Dadu	26.73	67.78	PK	10
Arba Minch	6.03	37.55	ET	10
Petropavl	54.87	69.15	KZ	10
Lhokseumawe	5.18	97.15	ID	10
Cypress	29.97	-95.70	US	10
Khandwa	21.82	76.35	IN	10
Puri	19.80	85.82	IN	10
Morena	26.50	78.00	IN	10
Nicosia	35.17	33.35	CY	10
Brescia	45.54	10.21	IT	10
Nasimshahr	35.57	51.16	IR	10
Ugep	5.81	8.08	NG	10
Kamina	-8.74	25.00	CD	10
Yanbu	24.09	38.06	SA	10
Nagareyama	35.86	139.90	JP	10
Charleroi	50.41	4.44	BE	10
Lạng Sơn	21.85	106.76	VN	10
Talhar	24.88	68.81	PK	10
Nyingchi	29.65	94.36	CN	10
Yuen Long San Hui	22.43	114.03	HK	10
Yuen Long	22.45	114.03	HK	10
Sumedang	-6.86	107.92	ID	10
Gyānpur	25.33	82.47	IN	10
Az Zāwīyah	32.76	12.73	LY	10
Salé Al Jadida	34.00	-6.74	MA	10
Bandar Utama	3.15	101.61	MY	10
Bukit Jalil	3.05	101.68	MY	10
Chakwama	11.56	9.66	NG	10
Qadirpur Ran	30.29	71.67	PK	10
Dajal	29.56	70.38	PK	10
El Dibir	11.77	51.22	SO	10
Beiliu	22.71	110.35	CN	8
Sirjan	29.45	55.68	IR	8
Iquique	-20.21	-70.15	CL	8
Thuận Thanh	21.05	106.08	VN	8
Balakovo	52.03	47.80	RU	8
Armavir	45.00	41.11	RU	8
Yachiyo	35.74	140.12	JP	8
Saidpur	25.78	88.89	BD	8
Quận Bốn	10.77	106.71	VN	8
Arīsh	31.13	33.80	EG	8
Rawang	3.32	101.58	MY	8
Dudley	52.50	-2.08	GB	8
Mushin	6.53	3.35	NG	8
Yuzhno-Sakhalinsk	46.95	142.74	RU	8
Hagen	51.36	7.47	DE	8
Salatiga	-7.33	110.49	ID	8
Rio Grande	-32.03	-52.10	BR	8
Guacara	10.23	-67.88	VE	8
Khūy	38.55	44.95	IR	8
Gliwice	50.30	18.68	PL	8
Changji	44.01	87.30	CN	8
Kodaira	35.73	139.49	JP	8
Plano Piloto	-15.79	-47.88	BR	8
Amarillo	35.22	-101.83	US	8
Bulandshahr	28.40	77.86	IN	8
Lusail	25.42	51.51	QA	8
Aberdeen	57.14	-2.10	GB	8
Taranto	40.46	17.25	IT	8
Capiatá	-25.36	-57.45	PY	8
Zango	-9.01	13.38	AO	8
Duyun	26.27	107.52	CN	8
Naivasha	-0.71	36.43	KE	8
Kaiyuan	23.70	103.30	CN	8
Cachoeiro de Itapemirim	-20.85	-41.11	BR	8
Rzeszów	50.04	22.00	PL	8
Rostock	54.09	12.14	DE	8
Parma	44.80	10.33	IT	8
Sibu	2.30	111.82	MY	8
Arnavutköy	41.18	28.74	TR	8
Itami	34.78	135.40	JP	8
Mentougou	39.94	116.09	CN	8
Bhind	26.57	78.79	IN	8
Akron	41.08	-81.52	US	8
Talca	-35.42	-71.65	CL	8
Kassel	51.32	9.50	DE	8
Ciudad Madero	22.25	-97.84	MX	8
Sawangan	-6.40	106.77	ID	8
Gemena	3.26	19.77	CD	8
Bhālswa Jahangirpur	28.74	77.17	IN	8
Lushui	25.82	98.86	CN	8
Bīrjand	32.87	59.22	IR	8
Toruń	53.01	18.60	PL	8
Almería	36.84	-2.46	ES	8
Jijiang	29.29	106.25	CN	8
Ahmadpur East	29.14	71.26	PK	8
Huánuco	-9.93	-76.24	PE	8
Higashihiroshima	34.41	132.74	JP	8
İzmit	40.76	29.93	TR	8
Reims	49.27	4.03	FR	8
Hanfeng	31.17	108.40	CN	8
Vancouver	45.64	-122.66	US	8
Birmingham	33.52	-86.80	US	8
Itabuna	-14.79	-39.28	BR	8
Laayoune	27.14	-13.19	EH	8
Khammam	17.25	80.14	IN	8
H̱olon	32.01	34.78	IL	8
Middelburg	-25.78	29.46	ZA	8
Icheon-si	37.28	127.44	KR	8
Khirdalan	40.45	49.76	AZ	8
Phra Pradaeng	13.66	100.53	TH	8
Moundou	8.57	16.08	TD	8
Sambhal	28.58	78.57	IN	8
Bhiwāni	28.79	76.14	IN	8
Engels	51.48	46.11	RU	8
Ciudad Lázaro Cárdenas	17.96	-102.20	MX	8
Mocuba	-16.84	36.99	MZ	8
Hetauda	27.43	85.03	NP	8
Durrës	41.32	19.45	AL	8
Suzuka	34.88	136.58	JP	8
Hub	25.03	66.89	PK	8
La Plata	-34.92	-57.95	AR	8
Janakpur	26.73	85.93	NP	8
Panvel	18.99	73.11	IN	8
Peicheng	34.74	116.92	CN	8
Maharagama	6.85	79.93	LK	8
Montgomery	32.37	-86.30	US	8
Liège	50.63	5.57	BE	8
Kumagaya	36.13	139.39	JP	8
Guri-si	37.60	127.14	KR	8
Ambāla	30.36	76.80	IN	8
Grand Rapids	42.96	-85.67	US	8
Prato	43.88	11.10	IT	8
Kumarapalayam	11.44	77.71	IN	8
Butwāl	27.69	83.45	NP	8
Dhirkot	34.04	73.58	PK	8
Kayes	14.45	-11.44	ML	8
Bontang	0.13	117.49	ID	8
Kafr ash Shaykh	31.11	30.94	EG	8
Tébessa	35.40	8.12	DZ	8
Kuala Kubu Baharu	3.56	101.66	MY	8
Karuri	-1.18	36.76	KE	8
Manéah	9.73	-13.42	GN	8
Severodvinsk	64.56	39.83	RU	8
Matuga	-4.17	39.57	KE	8
Düzce	40.84	31.16	TR	8
Nnewi	6.02	6.92	NG	8
Yamaguchi	34.18	131.47	JP	8
Alcalá de Henares	40.48	-3.36	ES	8
Başakşehir	41.11	28.79	TR	8
Ezhou	30.40	114.83	CN	8
Zhengding	38.15	114.57	CN	8
Būkān	36.52	46.21	IR	8
Braga	41.55	-8.42	PT	8
Garhi Khairo	28.06	67.98	PK	8
Luanshya	-13.14	28.42	ZM	8
Padalarang	-6.84	107.47	ID	8
Bang Khae	13.69	100.41	TH	8
Bago City	10.53	122.83	PH	8
Yongchuan	29.35	105.89	CN	8
Uji	34.89	135.80	JP	8
Machilīpatnam	16.19	81.14	IN	8
Hepu	21.66	109.20	CN	8
Aihui	49.98	127.48	CN	8
Hyesan	41.40	128.18	KP	8
Bayamo	20.37	-76.64	CU	8
Kielce	50.87	20.63	PL	8
Pār Naogaon	24.80	88.95	BD	8
Fuding	27.33	120.21	CN	8
Castanhal	-1.29	-47.93	BR	8
Zabrze	50.32	18.79	PL	8
Hamilton	-37.78	175.28	NZ	8
Bojnūrd	37.47	57.33	IR	8
Surulere	6.50	3.36	NG	8
Humen	22.82	113.67	CN	8
Benfica	-8.94	13.16	AO	8
Hat Yai	7.01	100.48	TH	8
Haicheng	40.85	122.75	CN	8
Curug	-6.27	106.56	ID	8
Barrancabermeja	7.07	-73.85	CO	8
Zlatoust	55.17	59.65	RU	8
Mukono	0.35	32.76	UG	8
Angren	41.02	70.14	UZ	8
Ciudad del Carmen	18.65	-91.83	MX	8
Khairpur Mir’s	27.53	68.76	PK	8
Khujand	40.28	69.62	TJ	8
Peoria	33.58	-112.24	US	8
Ashaiman	5.70	-0.03	GH	8
Tanjungbalai	2.97	99.80	ID	8
Providence	41.82	-71.41	US	8
Mahesāna	23.60	72.38	IN	8
Knoxville	35.96	-83.92	US	8
Rangel	-8.83	13.26	AO	8
Fuenlabrada	40.28	-3.79	ES	8
Hino	35.67	139.40	JP	8
Jhelum	32.93	73.73	PK	8
Mahbūbnagar	16.74	77.99	IN	8
Beipiao	41.79	120.78	CN	8
Pak Kret	13.91	100.50	TH	8
Cẩm Phả	21.01	107.27	VN	8
Al Fallūjah	33.35	43.79	IQ	8
Jinshanlu	47.85	88.13	CN	8
Ise-Ekiti	7.46	5.42	NG	8
Nova Friburgo	-22.28	-42.53	BR	8
Guarapuava	-25.39	-51.47	BR	8
Kofu	35.67	138.57	JP	8
Numazu	35.10	138.87	JP	8
Santa Bárbara d'Oeste	-22.75	-47.41	BR	8
Jōetsu	37.15	138.24	JP	8
Planaltina	-15.62	-47.65	BR	8
Sunrise Manor	36.21	-115.07	US	8
Sambalpur	21.47	83.98	IN	8
Syzran	53.16	48.47	RU	8
Danshui	25.17	121.44	TW	8
Bytom	50.35	18.93	PL	8
Mwene-Ditu	-7.01	23.45	CD	8
Ilhéus	-14.80	-39.03	BR	8
Panalanoy	11.25	125.01	PH	8
Guixi	30.33	107.35	CN	8
Odawara	35.26	139.16	JP	8
Labuan Bajo	-8.50	119.89	ID	8
Anjō	34.96	137.08	JP	8
George	-33.96	22.46	ZA	8
Tottori-shi	35.50	134.23	JP	8
Leganés	40.33	-3.76	ES	8
Acarigua	9.55	-69.20	VE	8
Hosa’ina	7.55	37.85	ET	8
Sai Mai	13.92	100.65	TH	8
Yawnghwe	20.66	96.93	MM	8
Mabalacat City	15.22	120.57	PH	8
Riohacha	11.54	-72.91	CO	8
Laizhou	37.18	119.94	CN	8
Grand Prairie	32.75	-97.00	US	8
Sorsogon	12.97	123.99	PH	8
Ait Melloul	30.34	-9.50	MA	8
Sutton	51.35	-0.20	GB	8
Shreveport	32.53	-93.75	US	8
Choa Chu Kang New Town	1.38	103.75	SG	8
Getafe	40.31	-3.73	ES	8
Quận Năm	10.76	106.67	VN	8
Bhusawal	21.04	75.79	IN	8
Alvorada	-30.00	-51.08	BR	8
Chilpancingo	17.55	-99.50	MX	8
Pinar del Río	22.42	-83.70	CU	8
Huixing	29.68	106.61	CN	8
Kırıkkale	39.85	33.51	TR	8
Batumi	41.64	41.63	GE	8
Burlington	43.39	-79.84	CA	8
Pābna	24.01	89.24	BD	8
Brownsville	25.90	-97.50	US	8
Changyuan	29.40	105.59	CN	8
Cienfuegos	22.15	-80.45	CU	8
Beersheba	31.25	34.79	IL	8
El Oued	33.36	6.86	DZ	8
Overland Park	38.98	-94.67	US	8
Raebareli	26.23	81.23	IN	8
Shangri-La	27.83	99.71	CN	8
Newport News	36.98	-76.43	US	8
Yangcheng	30.00	106.26	CN	8
Mopti	14.48	-4.18	ML	8
Khuraybat as Sūq	31.88	35.92	JO	8
Zawiya	32.75	12.73	LY	8
Zamora de Hidalgo	19.98	-102.29	MX	8
Haridwar	29.95	78.16	IN	8
Ad-Damazin	11.79	34.36	SD	8
Dunhuang	40.17	94.68	CN	8
Jing’an	22.21	113.29	CN	8
Le Havre	49.49	0.11	FR	8
Phusro	23.76	86.01	IN	8
Donostia / San Sebastián	43.31	-1.97	ES	8
Poza Rica de Hidalgo	20.53	-97.46	MX	8
Bilbeis	30.42	31.56	EG	8
Roxas City	11.59	122.75	PH	8
Paris 20 Ménilmontant	48.86	2.40	FR	8
Kütahya	39.42	29.98	TR	8
Palopo	-2.99	120.20	ID	8
Potsdam	52.40	13.07	DE	8
Modena	44.65	10.93	IT	8
Bolu	40.74	31.61	TR	8
Toyokawa	34.82	137.40	JP	8
Adoni	15.63	77.27	IN	8
Izumi	34.48	135.43	JP	8
Santa Anita - Los Ficus	-12.05	-76.97	PE	8
Zaoyang	32.13	112.75	CN	8
Paltan	23.74	90.41	BD	8
Al Qāmishlī	37.05	41.23	SY	8
Abakan	53.72	91.43	RU	8
Pemalang	-6.89	109.38	ID	8
Breda	51.59	4.78	NL	8
Langsa	4.47	97.97	ID	8
Vĩnh Châu	9.32	105.98	VN	8
Baishan	41.94	126.42	CN	8
Sūjāngarh	27.70	74.47	IN	8
Linhares	-19.39	-40.07	BR	8
Tachikawa	35.71	139.42	JP	8
Cergy-Pontoise	49.04	2.08	FR	8
Unaizah	26.10	44.00	SA	8
Mobile	30.69	-88.04	US	8
St Helens	53.45	-2.73	GB	8
Fort Lauderdale	26.12	-80.14	US	8
Lembang	-6.81	107.62	ID	8
Paris 18 Buttes-Montmartre	48.89	2.34	FR	8
Oradea	47.05	21.92	RO	8
Araguaína	-7.19	-48.21	BR	8
Saarbrücken	49.23	7.01	DE	8
Bunda	-2.02	33.87	TZ	8
Skikda	36.88	6.91	DZ	8
Tirmiz	37.22	67.28	UZ	8
Jaraguá do Sul	-26.49	-49.07	BR	8
Singosari	-7.89	112.67	ID	8
Porto Seguro	-16.45	-39.06	BR	8
Cúa	10.16	-66.88	VE	8
Sirsa	29.53	75.03	IN	8
Kamensk-Ural’skiy	56.41	61.93	RU	8
Reggio Calabria	38.11	15.66	IT	8
Dinapur Nizamat	25.64	85.05	IN	8
Santa Clarita	34.39	-118.54	US	8
Carletonville	-26.36	27.40	ZA	8
Dubréka	9.79	-13.52	GN	8
Metro	-5.11	105.31	ID	8
Banhā	30.46	31.18	EG	8
Bahraigh	27.57	81.59	IN	8
Ash Shaţrah	31.41	46.17	IQ	8
Tsing Yi Town	22.35	114.10	HK	8
Monywa	22.11	95.14	MM	8
Dessalines	19.26	-72.52	HT	8
Mwala	-1.35	37.45	KE	8
Kāraikkudi	10.07	78.77	IN	8
Araure	9.58	-69.24	VE	8
Barra Mansa	-22.54	-44.17	BR	8
Sultan Pur Majra	28.69	77.08	IN	8
Zhenping	33.03	112.23	CN	8
Anda	46.45	125.30	CN	8
Paris 13 Gobelins	48.83	2.36	FR	8
Petropavlovsk-Kamchatsky	53.06	158.63	RU	8
Wādī as Sīr	31.95	35.82	JO	8
Fardīs	35.76	51.00	IR	8
Chattanooga	35.05	-85.31	US	8
Guna	24.65	77.31	IN	8
Odense	55.40	10.39	DK	8
Sacaba	-17.40	-66.04	BO	8
Quetzaltenango	14.84	-91.52	GT	8
Chandannagar	22.86	88.37	IN	8
Baharampur	24.10	88.25	IN	8
Ploieşti	44.95	26.02	RO	8
Berazategui	-34.77	-58.21	AR	8
Shahuwadi	16.91	73.95	IN	8
Madanapalle	13.55	78.50	IN	8
Tangail	24.25	89.92	BD	8
Shulin	24.99	121.42	TW	8
Edirne	41.68	26.56	TR	8
Nepean	45.34	-75.72	CA	8
Pingwu County	32.41	104.53	CN	8
Kyaukpyu	19.43	93.55	MM	8
Phúc Yên	21.24	105.70	VN	8
Shivpuri	25.42	77.66	IN	8
Yangju	37.83	127.06	KR	8
Praga Południe	52.24	21.09	PL	8
Kasama	-10.21	31.18	ZM	8
Surendranagar	22.73	71.65	IN	8
Obuase	6.20	-1.67	GH	8
Ibirité	-20.02	-44.06	BR	8
Legaspi	13.14	123.74	PH	8
Phú Quốc	10.29	104.01	VN	8
Podolsk	55.42	37.55	RU	8
Purwakarta	-6.56	107.44	ID	8
Jizzax	40.13	67.83	UZ	8
Ferraz de Vasconcelos	-23.54	-46.37	BR	8
Ila Orangun	8.02	4.90	NG	8
Thị Trấn Đại Từ	21.63	105.64	VN	8
Neyveli	11.61	79.50	IN	8
Angra dos Reis	-23.01	-44.32	BR	8
Qianjiang	30.42	112.89	CN	8
Hamm	51.68	7.82	DE	8
Si Racha	13.17	100.93	TH	8
Tiaret	35.37	1.32	DZ	8
La Rioja	-29.41	-66.86	AR	8
Silchar	24.83	92.80	IN	8
Amadora	38.75	-9.23	PT	8
Cuautitlán	19.67	-99.18	MX	8
Ipswich	52.06	1.16	GB	8
Njeru	0.44	33.18	UG	8
Toliara	-23.35	43.67	MG	8
Paris 19 Buttes-Chaumont	48.88	2.38	FR	8
Saki	8.67	3.39	NG	8
Chlef	36.17	1.33	DZ	8
Fontanar	23.02	-82.41	CU	8
Seogwipo	33.25	126.56	KR	8
Concepcion	15.33	120.66	PH	8
Spring Valley	36.11	-115.25	US	8
Livingstone	-17.84	25.85	ZM	8
Potchefstroom	-26.72	27.10	ZA	8
Santa Rosa	38.44	-122.71	US	8
Sambizanga	-8.79	13.28	AO	8
Proddatūr	14.75	78.55	IN	8
Sittwe	20.15	92.90	MM	8
Dundo	-7.37	20.82	AO	8
Basel	47.56	7.57	CH	8
Meiktila	20.88	95.86	MM	8
Gulu	2.77	32.30	UG	8
Nijmegen	51.84	5.85	NL	8
Idkū	31.31	30.30	EG	8
Uppsala	59.86	17.64	SE	8
Hugli	22.91	88.40	IN	8
Hashtsāl	28.63	77.06	IN	8
Bragança Paulista	-22.95	-46.54	BR	8
Teresópolis	-22.42	-42.98	BR	8
San Luis Río Colorado	32.46	-114.77	MX	8
Santa Ana	13.99	-89.56	SV	8
Eugene	44.05	-123.09	US	8
Nador	35.17	-2.93	MA	8
Al Muharraq	26.26	50.61	BH	8
Bielsko-Biala	49.82	19.05	PL	8
Marsá Maţrūḩ	31.35	27.24	EG	8
Almere Stad	52.37	5.21	NL	8
Burgos	42.34	-3.70	ES	8
Gijang	35.24	129.21	KR	8
Lander	10.18	-66.70	VE	8
Saint-Étienne	45.43	4.39	FR	8
Amroha	28.90	78.47	IN	8
Narashino	35.68	140.04	JP	8
Béjaïa	36.76	5.08	DZ	8
Zhenzhou	32.28	119.17	CN	8
Tempe	33.41	-111.91	US	8
Xindi	29.82	113.47	CN	8
Oceanside	33.20	-117.38	US	8
Fengcheng	29.83	107.06	CN	8
Salem	44.94	-123.04	US	8
Wigan	53.54	-2.64	GB	8
Garden Grove	33.77	-117.94	US	8
Karaman	37.18	33.22	TR	8
Oshawa	43.90	-78.85	CA	8
Siverek	37.76	39.32	TR	8
Rancho Cucamonga	34.11	-117.59	US	8
Cape Coral	26.56	-81.95	US	8
Tân Châu	10.80	105.24	VN	8
Teluknaga	-6.10	106.64	ID	8
Jiutai	44.15	125.83	CN	8
Chhindwāra	22.06	78.94	IN	8
Itu	-23.26	-47.30	BR	8
Senador Canedo	-16.71	-49.09	BR	8
Khānaqīn	34.35	45.39	IQ	8
Naga	13.62	123.18	PH	8
Tomakomai	42.64	141.60	JP	8
Tambaram	12.92	80.13	IN	8
San Miguel de Allende	20.92	-100.74	MX	8
Cianjur	-6.82	107.14	ID	8
Pamulang	-6.34	106.74	ID	8
Hitachi	36.60	140.65	JP	8
Timon	-5.09	-42.84	BR	8
Bhetia	22.79	86.14	IN	8
Pathānkot	32.27	75.65	IN	8
Tando Adam	25.77	68.66	PK	8
Badlapur	19.16	73.27	IN	8
Cikupa	-6.24	106.51	ID	8
Puerto Cabello	10.47	-68.01	VE	8
Sakura	35.72	140.23	JP	8
Ube	33.94	131.25	JP	8
Daule	-1.86	-79.98	EC	8
Bayjī	34.93	43.49	IQ	8
Cuddalore	11.76	79.77	IN	8
Santander	43.47	-3.80	ES	8
Tlemcen	34.88	-1.31	DZ	8
Shimla	31.10	77.17	IN	8
Shāhīn Shahr	32.86	51.55	IR	8
Croydon	51.38	-0.10	GB	8
Myeik	12.44	98.60	MM	8
Khān Yūnis	31.34	34.31	PS	8
Dharān	26.81	87.28	NP	8
Mülheim	51.43	6.88	DE	8
Albacete	38.99	-1.86	ES	8
Bata	1.86	9.77	GQ	8
Kamakura	35.31	139.55	JP	8
Chicoloapan	19.42	-98.90	MX	8
Gadag-Betageri	15.42	75.62	IN	8
Licheng	23.30	113.82	CN	8
Izumo	35.37	132.77	JP	8
São Caetano do Sul	-23.62	-46.55	BR	8
Gadag	15.43	75.63	IN	8
Ongata Rongai	-1.40	36.76	KE	8
Tunja	5.54	-73.36	CO	8
Lages	-27.82	-50.33	BR	8
Quillacollo	-17.39	-66.28	BO	8
Alcorcón	40.35	-3.82	ES	8
Gisenyi	-1.70	29.26	RW	8
Poços de Caldas	-21.79	-46.56	BR	8
Isparta	37.76	30.55	TR	8
Warrington	53.39	-2.58	GB	8
Klaipėda	55.71	21.14	LT	8
Walsall	52.59	-1.98	GB	8
Herne	51.54	7.23	DE	8
Mansfield	53.13	-1.20	GB	8
Reggio nell'Emilia	44.70	10.63	IT	8
Castelló de la Plana	39.99	-0.05	ES	8
Barreiras	-12.15	-44.99	BR	8
Kēng Tung	21.63	99.93	MM	8
Sioux Falls	43.54	-96.73	US	8
Prizren	42.21	20.74	XK	8
Dongling	41.81	123.58	CN	8
Ungaran	-7.14	110.41	ID	8
Urayasu	35.66	139.90	JP	8
Long Khánh	10.93	107.25	VN	8
Dagupan	16.04	120.33	PH	8
Ontario	34.06	-117.65	US	8
Watthana	13.73	100.59	TH	8
Verāval	20.91	70.37	IN	8
Navsari	20.94	72.92	IN	8
Imabari	34.07	133.00	JP	8
Mansa	-11.20	28.89	ZM	8
Fort Collins	40.59	-105.08	US	8
Bảo Lộc	11.55	107.81	VN	8
Kulim	5.36	100.56	MY	8
Oshodi	6.56	3.34	NG	8
Ramat Gan	32.08	34.81	IL	8
Bahadurgarh	28.69	76.94	IN	8
Haldia	22.06	88.11	IN	8
Temirtau	50.05	72.95	KZ	8
Parnaíba	-2.90	-41.78	BR	8
Carolina	18.38	-65.96	PR	8
Rāiganj	25.61	88.12	IN	8
Malāyer	34.30	48.82	IR	8
Springfield	37.22	-93.30	US	8
Sunderland	54.90	-1.38	GB	8
Takaoka	36.75	137.02	JP	8
Baranovichi	53.13	26.01	BY	8
Malda	25.00	88.15	IN	8
Nishio	34.87	137.05	JP	8
San Luis	-33.29	-66.32	AR	8
Ouargla	31.95	5.33	DZ	8
Olsztyn	53.78	20.49	PL	8
Kipushi	-11.76	27.25	CD	8
Yuen Long Kau Hui	22.45	114.03	HK	8
Laiyang	36.98	120.71	CN	8
Jaunpur	25.75	82.69	IN	8
Khlong Sam Wa	13.87	100.74	TH	8
Chūō	35.67	139.78	JP	8
Mufulira	-12.55	28.24	ZM	8
Deoli	28.50	77.23	IN	8
Jaffna	9.67	80.01	LK	8
Arad	46.18	21.32	RO	8
Chetumal	18.52	-88.30	MX	8
Bharūch	21.69	72.98	IN	8
Gurúè	-15.47	36.98	MZ	8
San Miguel	-34.54	-58.71	AR	8
Hirosaki	40.59	140.47	JP	8
Pilsen	49.75	13.38	CZ	8
Chalco	19.26	-98.90	MX	8
Toulon	43.12	5.93	FR	8
Hoshiārpur	31.54	75.91	IN	8
Calabozo	8.92	-67.43	VE	8
Jabālyā	31.53	34.48	PS	8
Araraquara	-21.79	-48.18	BR	8
Yopal	5.34	-72.39	CO	8
Ituzaingó	-27.59	-56.69	AR	8
Piranshahr	36.70	45.14	IR	8
Mahābād	36.76	45.72	IR	8
Florencia	1.62	-75.60	CO	8
Tây Hồ	21.07	105.81	VN	8
Moratuwa	6.77	79.88	LK	8
Angers	47.47	-0.55	FR	8
Ilford	51.56	0.07	GB	8
Hasilpur	29.69	72.55	PK	8
Rio das Ostras	-22.53	-41.95	BR	8
Pátra	38.25	21.74	GR	8
Đồng Xoài	11.53	106.88	VN	8
Jamālpur	24.92	89.95	BD	8
Kushiro	42.98	144.37	JP	8
Berezniki	59.41	56.82	RU	8
Awka	6.21	7.07	NG	8
Volgodonsk	47.51	42.15	RU	8
Oyama	36.30	139.80	JP	8
Ijero-Ekiti	7.82	5.07	NG	8
Jīnd	29.32	76.32	IN	8
Miass	55.05	60.11	RU	8
Tuguegarao	17.62	121.72	PH	8
Carúpano	10.67	-63.25	VE	8
Kumbakonam	10.96	79.39	IN	8
Plumbon	-6.71	108.47	ID	8
Darmstadt	49.87	8.65	DE	8
Mary	37.59	61.83	TM	8
Novocherkassk	47.42	40.09	RU	8
Elk Grove	38.41	-121.37	US	8
Mohali	30.68	76.72	IN	8
Sampit	-2.53	112.95	ID	8
Clarksville	36.53	-87.36	US	8
Wan Chai	22.28	114.17	HK	8
Linköping	58.41	15.62	SE	8
Iwata	34.70	137.85	JP	8
Kamalia	30.73	72.65	PK	8
Pembroke Pines	26.00	-80.22	US	8
Maicao	11.38	-72.24	CO	8
Obihiro	42.92	143.20	JP	8
Fatehpur	25.93	80.81	IN	8
Osnabrück	52.27	8.05	DE	8
Calama	-22.46	-68.92	CL	8
Nepalgunj	28.05	81.62	NP	8
Comitán	16.24	-92.14	MX	8
Ocumare del Tuy	10.12	-66.78	VE	8
Niiza	35.82	139.56	JP	8
Greater Sudbury	46.49	-80.99	CA	8
Ulanhot	46.08	122.08	CN	8
Khobar	26.28	50.21	SA	8
Songcheng	26.88	120.00	CN	8
Bang Khun Thian	13.66	100.43	TH	8
Murfreesboro	35.85	-86.39	US	8
Pindamonhangaba	-22.92	-45.46	BR	8
Bushehr	28.97	50.84	IR	8
Dar Bouazza	33.52	-7.82	MA	8
Tonk	26.17	75.79	IN	8
Saqqez	36.25	46.27	IR	8
Béchar	31.62	-2.22	DZ	8
Tam Kỳ	15.57	108.47	VN	8
Gölbaşı	39.79	32.81	TR	8
Francisco Morato	-23.28	-46.75	BR	8
Bima	-8.46	118.73	ID	8
Mu-se	24.00	97.90	MM	8
Udupi	13.33	74.75	IN	8
Shahrud	36.42	54.98	IR	8
Banjaran	-7.05	107.59	ID	8
Thenali	16.24	80.64	IN	8
Mthatha	-31.59	28.78	ZA	8
Hengshan	45.21	130.90	CN	8
Slough	51.51	-0.60	GB	8
Bocoio	-12.47	14.14	AO	8
Port Saint Lucie	27.29	-80.35	US	8
Sītāpur	27.56	80.68	IN	8
Zenica	44.20	17.90	BA	8
Solingen	51.17	7.08	DE	8
Itapetininga	-23.59	-48.05	BR	8
Ðông Hà	16.82	107.10	VN	8
Corona	33.88	-117.57	US	8
Ḩawallī	29.33	48.03	KW	8
Musoma	-1.50	33.80	TZ	8
Inisa	7.85	4.33	NG	8
Nazran	43.23	44.77	RU	8
Ilagan	17.15	121.89	PH	8
Port-Gentil	-0.72	8.78	GA	8
Bhadrāvati	13.85	75.71	IN	8
Santana de Parnaíba	-23.44	-46.92	BR	8
Hadano	35.37	139.22	JP	8
Piraeus	37.94	23.65	GR	8
Vapi	20.37	72.90	IN	8
Bournemouth	50.72	-1.88	GB	8
Sidon	33.56	35.37	LB	8
Caxias	-4.86	-43.36	BR	8
‘Ibrī	23.23	56.52	OM	8
Jomvu	-3.99	39.61	KE	8
Garissa	-0.45	39.65	KE	8
Moga	30.81	75.17	IN	8
Peterborough	52.57	-0.25	GB	8
Piedecuesta	6.99	-73.05	CO	8
Tongzhou	39.90	116.66	CN	8
Ludwigshafen am Rhein	49.48	8.45	DE	8
Lat Krabang	13.72	100.78	TH	8
Şalālah	17.02	54.09	OM	8
Büyükçekmece	41.02	28.59	TR	8
Rāj-Nāndgaon	21.10	81.03	IN	8
Aydın	37.85	27.84	TR	8
Envigado	6.18	-75.59	CO	8
Al-Junaynah	13.45	22.45	SD	8
Anbu	23.45	116.68	CN	8
McKinney	33.20	-96.62	US	8
Mostaganem	35.93	0.09	DZ	8
Chirchiq	41.47	69.58	UZ	8
Bandar-e Māhshahr	30.56	49.19	IR	8
Leverkusen	51.03	6.98	DE	8
Pandi	14.87	120.96	PH	8
Capas	15.33	120.59	PH	8
Ning’er	23.04	101.04	CN	8
Haarlem	52.38	4.64	NL	8
Arnhem	51.98	5.91	NL	8
Nkongsamba	4.95	9.94	CM	8
El Vigía	8.61	-71.66	VE	8
Araucária	-25.59	-49.41	BR	8
Robertsonpet	12.96	78.28	IN	8
Kitale	1.02	35.01	KE	8
Suleja	9.18	7.18	NG	8
Taza	34.21	-4.01	MA	8
Oxford	51.75	-1.26	GB	8
Al Maţarīyah	31.18	32.03	EG	8
Kunduz	36.73	68.86	AF	8
Trảng Bàng	11.03	106.36	VN	8
Unnāo	26.55	80.49	IN	8
N'dalatando	-9.30	14.91	AO	8
Budaun	28.04	79.13	IN	8
Ōgaki	35.35	136.62	JP	8
Newport	51.59	-3.00	GB	8
Coquimbo	-29.95	-71.34	CL	8
Baubau	-5.46	122.60	ID	8
Đưc Trọng	11.74	108.37	VN	8
Blitar	-8.10	112.17	ID	8
Alagoinhas	-12.14	-38.42	BR	8
KwaDukuza	-29.33	31.29	ZA	8
Miyakonojō	31.73	131.07	JP	8
Madhyamgram	22.69	88.45	IN	8
Lancaster	34.70	-118.14	US	8
Rubtsovsk	51.51	81.21	RU	8
Tacheng	46.75	82.96	CN	8
Kindia	10.06	-12.87	GN	8
Tauranga	-37.69	176.17	NZ	8
Kalemie	-5.95	29.19	CD	8
Chatuchak	13.83	100.56	TH	8
San Juan de los Morros	9.91	-67.35	VE	8
Sayama	35.85	139.41	JP	8
Sullana	-4.90	-80.69	PE	8
's-Hertogenbosch	51.70	5.30	NL	8
Szeged	46.25	20.15	HU	8
Malakal	9.53	31.66	SS	8
Chittoor	13.21	79.10	IN	8
Toledo	-24.71	-53.74	BR	8
Salamanca	20.57	-101.20	MX	8
Ban Khlong Prawet	13.72	100.68	TH	8
La Gi	10.66	107.77	VN	8
Anderlecht	50.84	4.31	BE	8
Mytishchi	55.91	37.73	RU	8
Delegación Cuajimalpa de Morelos	19.37	-99.29	MX	8
Hebron	31.53	35.09	PS	8
Camaragibe	-8.02	-34.98	BR	8
Mogi Guaçu	-22.37	-46.95	BR	8
Mejicanos	13.72	-89.19	SV	8
Trà Vinh	9.95	106.34	VN	8
Parepare	-4.01	119.63	ID	8
Jāmuria	23.70	87.08	IN	8
Koudougou	12.25	-2.37	BF	8
Taunggyi	20.79	97.04	MM	8
Dhamār	14.54	44.41	YE	8
Ash Sharqāt	35.52	43.23	IQ	8
Dijon	47.31	5.01	FR	8
Salavat	53.38	55.91	RU	8
Ede	7.74	4.44	NG	8
Sukrah	36.88	10.25	TN	8
Manzanillo	19.12	-104.34	MX	8
Jalapa	14.64	-89.99	GT	8
Paech’ŏn-ŭp	37.99	126.30	KP	8
Cary	35.79	-78.78	US	8
Tahoua	14.89	5.27	NE	8
Alexandria	38.80	-77.05	US	8
Tuxtepec	18.09	-96.13	MX	8
Puthia	24.37	88.83	BD	8
Paris 16 Passy	48.86	2.28	FR	8
Zhicheng	30.30	111.50	CN	8
Ang Mo Kio New Town	1.38	103.84	SG	8
Limuru	-1.11	36.64	KE	8
San Miguel del Padrón	23.10	-82.33	CU	8
Tarija	-21.54	-64.73	BO	8
Patos de Minas	-18.58	-46.52	BR	8
Oldenburg	53.14	8.21	DE	8
Paris 17 Batignolles-Monceau	48.88	2.32	FR	8
Matsusaka	34.58	136.54	JP	8
Catamarca	-28.47	-65.79	AR	8
Tochigi	36.38	139.73	JP	8
Bordj Bou Arreridj	36.07	4.76	DZ	8
Dīla	6.42	38.32	ET	8
Jaigaon	26.85	89.38	IN	8
Atibaia	-23.12	-46.55	BR	8
Batāla	31.81	75.20	IN	8
Grenoble	45.18	5.71	FR	8
Itapecerica da Serra	-23.72	-46.85	BR	8
Sāmarrā’	34.20	43.89	IQ	8
Tempe Junction	33.41	-111.94	US	8
Palmdale	34.58	-118.12	US	8
George Town	5.41	100.34	MY	8
El Achir	36.06	4.63	DZ	8
Hayward	37.67	-122.08	US	8
Orai	25.99	79.45	IN	8
Thốt Nốt	10.27	105.53	VN	8
Gweru	-19.45	29.82	ZW	8
Abaetetuba	-1.72	-48.88	BR	8
Panguíla	-8.69	13.45	AO	8
Chom Thong	13.68	100.48	TH	8
Sunggal	3.58	98.62	ID	8
Diourbel	14.65	-16.24	SN	8
Ueda	36.40	138.28	JP	8
Aberdeen	22.25	114.15	HK	8
Salinas	36.68	-121.66	US	8
Cuautla	18.81	-98.94	MX	8
Salzburg	47.80	13.04	AT	8
Perbaungan	3.57	98.96	ID	8
Nong Chok	13.86	100.86	TH	8
Ussuriysk	43.80	131.96	RU	8
Arif Wala	26.32	66.30	PK	8
Nanpiao	41.10	120.75	CN	8
Livorno	43.54	10.33	IT	8
Río Cuarto	-33.13	-64.35	AR	8
Harar	9.31	42.12	ET	8
Tiraspol	46.84	29.63	MD	8
Enfield Town	51.65	-0.08	GB	8
Westonaria	-26.32	27.65	ZA	8
Lizhi	29.70	107.40	CN	8
Hitachi-Naka	36.40	140.53	JP	8
Saharsa	25.87	86.60	IN	8
Qalyub	30.18	31.21	EG	8
Escuintla	14.30	-90.79	GT	8
Marbella	36.52	-4.89	ES	8
Ereğli	37.51	34.05	TR	8
Batu Pahat	1.85	102.93	MY	8
Sitiawan	4.22	100.70	MY	8
Mariveles	14.43	120.49	PH	8
San Pablo de las Salinas	19.67	-99.09	MX	8
Lampang	18.29	99.49	TH	8
York	53.96	-1.08	GB	8
Bạc Liêu	9.29	105.73	VN	8
Juja	-1.10	37.01	KE	8
Nek’emtē	9.08	36.55	ET	8
Örebro	59.27	15.21	SE	8
Al Miqdādīyah	33.98	44.94	IQ	8
Katsuta	36.38	140.53	JP	8
Malabo	3.76	8.78	GQ	8
Vidisha	23.53	77.81	IN	8
Tuy Hòa	13.10	109.32	VN	8
Yizhou	24.50	108.67	CN	8
Xinqiao	31.07	121.31	CN	8
Sunnyvale	37.37	-122.04	US	8
Tema	5.67	-0.02	GH	8
Đức Phổ	14.81	108.96	VN	8
San Martin Texmelucan de Labastida	19.28	-98.44	MX	8
Ar Ramthā	32.56	36.01	JO	8
Hanumāngarh	29.58	74.33	IN	8
Zemun	44.85	20.40	RS	8
Telford	52.68	-2.45	GB	8
Kisi	9.08	3.85	NG	8
Nilópolis	-22.81	-43.41	BR	8
Villa Canales	14.48	-90.53	GT	8
Guyong	14.84	120.98	PH	8
Settat	33.00	-7.62	MA	8
Brusque	-27.10	-48.91	BR	8
Paço do Lumiar	-2.53	-44.11	BR	8
Jampur	29.64	70.60	PK	8
Port Louis	-20.16	57.50	MU	8
Kawanishi	34.82	135.42	JP	8
Thānesar	29.97	76.83	IN	8
Al Ḩawāmidīyah	29.90	31.25	EG	8
Hassan	13.01	76.10	IN	8
Lianghu	29.99	120.90	CN	8
Kishangarh	26.59	74.85	IN	8
Birendranagar	28.60	81.62	NP	8
Dalūpura	28.61	77.32	IN	8
Guangshui	31.62	114.00	CN	8
Saint-Denis	-20.88	55.45	RE	8
Brăila	45.27	27.97	RO	8
Lyubertsy	55.68	37.89	RU	8
Bumba	2.19	22.47	CD	8
Rudrapur	28.98	79.40	IN	8
La Serena	-29.91	-71.25	CL	8
Miskolc	48.10	20.78	HU	8
Abū Kabīr	30.73	31.67	EG	8
Fu’an	27.09	119.64	CN	8
Kitengela	-1.48	36.96	KE	8
Frisco	33.15	-96.82	US	8
Zhaodong	46.05	125.96	CN	8
Wujiaqu	44.16	87.52	CN	8
Shomolu	6.54	3.37	NG	8
Janzūr	32.82	13.02	LY	8
Xai-Xai	-25.05	33.64	MZ	8
Nalgonda	17.05	79.27	IN	8
Katabi	0.08	32.47	UG	8
Gwangyang	34.94	127.70	KR	8
Kovrov	56.36	41.32	RU	8
Viranşehir	37.22	39.76	TR	8
Noda	35.95	139.87	JP	8
San Cristóbal	18.42	-70.11	DO	8
East Chattanooga	35.07	-85.25	US	8
Limassol	34.68	33.04	CY	8
Kariya	34.98	136.98	JP	8
Pasadena	29.69	-95.21	US	8
Mīt Ghamr	30.72	31.26	EG	8
Sanshui	23.15	112.89	CN	8
Jackson	32.30	-90.18	US	8
Enschede	52.22	6.90	NL	8
Boshan	36.48	117.83	CN	8
Hazāribāgh	23.99	85.36	IN	8
Yangchun	22.17	111.78	CN	8
Souk Ahras	36.29	7.95	DZ	8
Musanze	-1.50	29.63	RW	8
Medinīpur	22.42	87.32	IN	8
Andong	36.57	128.72	KR	8
Bālurghāt	25.22	88.78	IN	8
Pomona	34.06	-117.75	US	8
Valle de La Pascua	9.22	-66.01	VE	8
Chincha Alta	-13.41	-76.13	PE	8
Cairns	-16.92	145.77	AU	8
Fyzābād	26.78	82.15	IN	8
Thị Trấn Thuận Châu	21.44	103.69	VN	8
Dinapore	25.64	85.05	IN	8
Dingzhou	38.51	114.99	CN	8
As Samawah	31.33	45.29	IQ	8
Porbandar	21.64	69.61	IN	8
Sinp’o	40.04	128.19	KP	8
Pengpu	31.29	121.44	CN	8
Wazirabad	32.44	74.12	PK	8
Lakewood	39.70	-105.08	US	8
Baqubah	33.75	44.61	IQ	8
Sumayl	36.86	42.85	IQ	8
Simele	36.86	42.85	IQ	8
Neuss	51.20	6.69	DE	8
Chenghua	23.46	116.77	CN	8
Songnim-ni	38.76	125.64	KP	8
Bānda	25.48	80.33	IN	8
Pouso Alegre	-22.23	-45.94	BR	8
Cần Giuộc	10.61	106.67	VN	8
Longfeng	46.53	125.10	CN	8
Beining	41.60	121.79	CN	8
Gonbad-e Kāvūs	37.25	55.17	IR	8
Etwatwa	-26.13	28.45	ZA	8
Higashimurayama	35.75	139.47	JP	8
Garanhuns	-8.88	-36.50	BR	8
Hindupur	13.83	77.49	IN	8
Stavanger	58.97	5.73	NO	8
Bintulu	3.17	113.03	MY	8
Poole	50.71	-1.98	GB	8
Akhmīm	26.56	31.75	EG	8
Kohat	33.58	71.45	PK	8
Regensburg	49.02	12.10	DE	8
Layyah	30.96	70.94	PK	8
Girga	26.34	31.89	EG	8
Koforidua	6.09	-0.26	GH	8
Logroño	42.47	-2.45	ES	8
Beāwar	26.10	74.32	IN	8
Shujaabad	29.88	71.29	PK	8
Escondido	33.12	-117.09	US	8
Ṣuwayliḥ	32.02	35.84	JO	8
Erzincan	39.74	39.49	TR	8
Kırşehir	39.15	34.16	TR	8
La Laguna	28.49	-16.32	ES	8
Kokshetau	53.28	69.39	KZ	8
Eminabad	32.04	74.26	PK	8
Anantnag	33.73	75.15	IN	8
Kukichūō	36.07	139.67	JP	8
Badajoz	38.88	-6.97	ES	8
Serilingampalle	17.49	78.30	IN	8
Talcahuano	-36.72	-73.12	CL	8
Chillán	-36.61	-72.10	CL	8
Jaranwala	31.33	73.42	PK	8
Kỳ Anh	18.06	106.30	VN	8
Nong Khaem	13.71	100.35	TH	8
Piedras Negras	28.70	-100.52	MX	8
Kızıltepe	37.19	40.58	TR	8
Musashino	35.71	139.56	JP	8
Paranaguá	-25.52	-48.53	BR	8
Balashikha	55.79	37.95	RU	8
Raigarh	21.90	83.40	IN	8
Gloucester	45.35	-75.63	CA	8
Vryheid	-27.77	30.79	ZA	8
Malkajgiri	17.45	78.53	IN	8
Gimcheon	36.12	128.12	KR	8
Bercham	4.64	101.14	MY	8
Setia Alam	3.10	101.46	MY	8
Bandar Tasik Puteri	3.29	101.47	MY	8
Tordher	33.99	72.29	PK	8
Dili	-8.56	125.57	TL	8
Shāntipur	23.25	88.43	IN	8
Chishtian	29.80	72.86	PK	8
Playa del Carmen	20.63	-87.08	MX	8
Santa Rita	-7.11	-34.98	BR	8
Split	43.51	16.44	HR	8
Ursynów	52.15	21.05	PL	8
Hollywood	26.01	-80.15	US	8
Harunabad	29.61	73.14	PK	8
Shūnan	34.08	131.83	JP	8
Agadez	16.97	7.99	NE	8
Burnley	53.80	-2.23	GB	8
Reẖovot	31.89	34.81	IL	8
Watampone	-4.54	120.33	ID	8
Sabha	27.04	14.43	LY	8
Disūq	31.13	30.65	EG	8
Cagliari	39.23	9.12	IT	8
Harrow	51.58	-0.33	GB	8
Berrechid	33.27	-7.59	MA	8
Queimados	-22.72	-43.56	BR	8
Tambacounda	13.77	-13.67	SN	8
Huddersfield	53.65	-1.78	GB	8
Ārabī	9.96	42.49	ET	8
Kerch	45.36	36.48	UA	8
Saguenay	48.42	-71.07	CA	8
Fazenda Rio Grande	-25.66	-49.31	BR	8
Komaki	35.28	136.92	JP	8
Marvdasht	29.87	52.80	IR	8
Melitopol	46.85	35.38	UA	8
Dunhua	43.37	128.23	CN	8
Bhuj	23.25	69.67	IN	8
Jyväskylä	62.24	25.72	FI	8
Yonago	35.43	133.33	JP	8
Ruqi	9.97	43.43	SO	8
Rimini	44.06	12.57	IT	8
Coquitlam	49.28	-122.78	CA	8
Arar	30.98	41.04	SA	8
Valencia	34.44	-118.61	US	8
Moreno	-34.63	-58.79	AR	8
Tama	35.64	139.47	JP	8
Rockford	42.27	-89.09	US	8
Kalaban Koro	12.57	-8.03	ML	8
El Limón	10.31	-67.63	VE	8
Nîmes	43.84	4.36	FR	8
Dundee	56.47	-2.97	GB	8
Bārākpur	22.77	88.36	IN	8
Sujiatun	41.66	123.34	CN	8
Astanajapura	-6.80	108.63	ID	8
Ciudad Delicias	28.19	-105.47	MX	8
Siguiri	11.42	-9.17	GN	8
Mbanza Kongo	-6.27	14.24	AO	8
East Hampton	37.04	-76.33	US	8
Honggang	46.40	124.88	CN	8
Kiambu	-1.17	36.84	KE	8
Clermont-Ferrand	45.78	3.09	FR	8
Joliet	41.53	-88.08	US	8
Barrie	44.40	-79.67	CA	8
Bang Kapi	13.77	100.65	TH	8
Savannah	32.08	-81.10	US	8
Paterson	40.92	-74.17	US	8
Kolomna	55.07	38.78	RU	8
Hājīpur	25.69	85.21	IN	8
Rafsanjān	30.41	55.99	IR	8
Hòa Thành	11.29	106.13	VN	8
Mestre	45.49	12.25	IT	8
Bridgeport	41.18	-73.19	US	8
Kragujevac	44.02	20.92	RS	8
Aktau	43.66	51.17	KZ	8
Sasarām	24.95	84.02	IN	8
Bohuniya	50.28	28.61	UA	8
Iruma	35.82	139.37	JP	8
Renca	-33.40	-70.71	CL	8
Kramatorsk	48.73	37.57	UA	8
Naperville	41.79	-88.15	US	8
Manama	26.23	50.59	BH	8
Colima	19.24	-103.71	MX	8
Bhimavaram	16.54	81.52	IN	8
Lárisa	39.63	22.42	GR	8
Nakhodka	42.84	132.92	RU	8
Debre Birhan	9.68	39.53	ET	8
Cacuaco	-8.78	13.37	AO	8
Aix-en-Provence	43.53	5.45	FR	8
Cam Ranh	11.92	109.16	VN	8
Jalalpur Jattan	32.64	74.21	PK	8
Matanzas	23.04	-81.58	CU	8
Beed	18.99	75.76	IN	8
Khasnahzān	36.20	44.14	IQ	8
Taozhou	30.91	119.41	CN	8
Saint-Quentin-en-Yvelines	48.77	2.02	FR	8
Bandar Bukit Raja	3.09	101.43	MY	8
Blackburn	53.75	-2.48	GB	8
Rosemont–La Petite-Patrie	45.54	-73.61	CA	8
Colina	-33.20	-70.67	CL	8
Burāri	28.76	77.20	IN	8
Ruda Śląska	50.26	18.86	PL	8
Nouadhibou	20.94	-17.04	MR	8
Puerto Plata	19.79	-70.69	DO	8
Urdaneta	15.98	120.57	PH	8
Krishnanagar	23.41	88.49	IN	8
Xinji	37.93	115.22	CN	8
Jutiapa	14.28	-89.89	GT	8
Chitradurga	14.22	76.40	IN	8
Bueng Kum	13.79	100.67	TH	8
Cambridge	52.20	0.12	GB	8
Kampung Pasir Gudang Baru	1.47	103.88	MY	8
Kampung Sungai Glugur	5.37	100.31	MY	8
Dibrugarh	27.48	94.91	IN	8
Médéa	36.26	2.75	DZ	8
Taishan	22.25	112.78	CN	8
El Eulma	36.15	5.69	DZ	8
Pécs	46.08	18.23	HU	8
Giá Rai	9.23	105.46	VN	8
Abohar	30.14	74.20	IN	8
Tiruvannamalai	12.23	79.07	IN	8
Teixeira de Freitas	-17.54	-39.74	BR	8
Gainesville	29.65	-82.32	US	8
Concordia	-31.39	-58.02	AR	8
Botucatu	-22.89	-48.45	BR	8
Fujieda	34.87	138.27	JP	8
Spanish Town	17.99	-76.96	JM	8
Blackpool	53.82	-3.05	GB	8
Urganch	41.55	60.63	UZ	8
Bukoba	-1.33	31.81	TZ	8
Kaithal	29.80	76.40	IN	8
Ingombota	-8.82	13.23	AO	8
Brest	48.39	-4.49	FR	8
Basildon	51.57	0.46	GB	8
Franco da Rocha	-23.32	-46.73	BR	8
Salamanca	40.97	-5.66	ES	8
Villeray–Saint-Michel–Parc-Extension	45.56	-73.61	CA	8
Mesquite	32.77	-96.60	US	8
Ashikaga	36.33	139.45	JP	8
Huyện Lâm Hà	11.82	108.21	VN	8
Acheng	45.55	126.95	CN	8
Kelowna	49.88	-119.49	CA	8
Umarkot	25.36	69.74	PK	8
León	12.44	-86.88	NI	8
Kakamigahara	35.42	136.87	JP	8
Le Mans	48.00	0.20	FR	8
Lodhran	29.53	71.63	PK	8
Campo Largo	-25.46	-49.53	BR	8
Trois-Rivières	46.35	-72.55	CA	8
Hailin	44.57	129.39	CN	8
Tsuchiura	36.09	140.21	JP	8
Elektrostal’	55.79	38.46	RU	8
Balasore	21.49	86.93	IN	8
Yong’an	31.02	109.46	CN	8
Kampong Pasir Ris	1.38	103.93	SG	8
Huelva	37.27	-6.94	ES	8
Navoiy	40.08	65.38	UZ	8
Syracuse	43.05	-76.15	US	8
Ashkelon	31.67	34.57	IL	8
Pinetown	-29.82	30.89	ZA	8
Kusatsu	35.02	135.97	JP	8
Nanjin	29.98	106.27	CN	8
Guelph	43.55	-80.26	CA	8
Godhra	22.78	73.61	IN	8
Khemisset	33.82	-6.07	MA	8
Çanakkale	40.16	26.41	TR	8
Torrance	33.84	-118.34	US	8
Três Lagoas	-20.79	-51.70	BR	8
San Jose	12.35	121.07	PH	8
Ladysmith	-28.56	29.78	ZA	8
Lévis	46.80	-71.18	CA	8
Heidelberg	49.41	8.69	DE	8
Fresnillo	23.17	-102.87	MX	8
Touggourt	33.11	6.07	DZ	8
Shillong	25.57	91.88	IN	8
Surprise	33.63	-112.33	US	8
Norwich	52.63	1.30	GB	8
Tịnh Biên	10.60	104.94	VN	8
Moriguchi	34.73	135.57	JP	8
Amiens	49.90	2.30	FR	8
Cai Lậy	10.40	106.12	VN	8
Rewāri	28.20	76.62	IN	8
Basirhat City	22.66	88.85	IN	8
Aalborg	57.05	9.92	DK	8
La Trinidad	16.45	120.59	PH	8
Ghardaïa	32.49	3.67	DZ	8
Timika	-4.61	136.68	ID	8
Pyatigorsk	44.05	43.05	RU	8
Teófilo Otoni	-17.86	-41.51	BR	8
Mbanza-Ngungu	-5.26	14.86	CD	8
Mercier–Hochelaga-Maisonneuve	45.57	-73.55	CA	8
Okinawa	26.34	127.80	JP	8
Middlesbrough	54.58	-1.23	GB	8
Shahrisabz	39.06	66.83	UZ	8
Moro	26.66	68.00	PK	8
Ch’ŏngdan-ŭp	37.97	125.94	KP	8
Rybnik	50.10	18.54	PL	8
Saïda	34.83	0.15	DZ	8
Tuzla	44.54	18.67	BA	8
eMbalenhle	-26.53	29.07	ZA	8
Trindade	-16.65	-49.49	BR	8
Khanpur	28.65	70.66	PK	8
Columbia	34.00	-81.03	US	8
Nawābganj	24.59	88.27	BD	8
Inezgane	30.36	-9.54	MA	8
Puerto Cortez	15.83	-87.93	HN	8
Toowoomba	-27.56	151.95	AU	8
Paderborn	51.72	8.75	DE	8
Misato, Saitama	35.84	139.88	JP	8
Chhatarpur	24.92	79.59	IN	8
Kimberley	-28.73	24.76	ZA	8
Alto Hospicio	-20.27	-70.10	CL	8
Ciego de Ávila	21.84	-78.76	CU	8
Samālūţ	28.31	30.71	EG	8
Jieshou	33.26	115.36	CN	8
Maykop	44.61	40.10	RU	8
Attock City	33.77	72.36	PK	8
Kisaran	2.98	99.62	ID	8
Mojokerto	-7.47	112.43	ID	8
Facatativá	4.81	-74.35	CO	8
Masai	1.49	103.88	MY	8
Punto Fijo	11.69	-70.20	VE	8
Myingyan	21.46	95.39	MM	8
Kamālshahr	35.86	50.87	IR	8
Mandsaur	24.07	75.07	IN	8
Zheleznodorozhnyy	55.74	38.02	RU	8
Chas	23.64	86.17	IN	8
Jahrom	28.50	53.56	IR	8
Tours	47.39	0.70	FR	8
Pālanpur	24.17	72.44	IN	8
Bondoukou	8.04	-2.80	CI	8
Chichicastenango	14.94	-91.11	GT	8
Tarragona	41.12	1.25	ES	8
Cachoeirinha	-29.95	-51.09	BR	8
Tobruk	32.09	23.95	LY	8
Sinch’ŏn-ŭp	38.35	125.48	KP	8
Abbotsford	49.06	-122.25	CA	8
Bolton	53.58	-2.43	GB	8
Yushu	33.00	97.01	CN	8
Piteşti	44.85	24.87	RO	8
Potosí	-19.58	-65.75	BO	8
Limoges	45.83	1.25	FR	8
Salto	-23.20	-47.29	BR	8
Asaka	35.80	139.60	JP	8
Ghazni	33.55	68.42	AF	8
Orange	33.79	-117.85	US	8
Wola	52.23	20.96	PL	8
Īlām	33.64	46.42	IR	8
Gongzhuling	43.50	124.82	CN	8
Shimotoda	35.81	139.69	JP	8
Comodoro Rivadavia	-45.86	-67.49	AR	8
Kampung Sungai Ara	5.33	100.27	MY	8
Fullerton	33.87	-117.93	US	8
Killeen	31.12	-97.73	US	8
Norilsk	69.35	88.20	RU	8
Lleida	41.62	0.62	ES	8
Coimbra	40.21	-8.42	PT	8
Mtwara	-10.27	40.18	TZ	8
Manjhand	25.91	68.24	PK	8
Beni	0.49	29.47	CD	8
Debre Mark’os	10.35	37.73	ET	8
Norzagaray	14.91	121.05	PH	8
Qeładizê	36.18	45.13	IQ	8
Nigel	-26.43	28.48	ZA	8
Catacamas	14.85	-85.89	HN	8
Buea	4.15	9.24	CM	8
Shuizhai	23.93	115.76	CN	8
Al’met’yevsk	54.90	52.32	RU	8
McAllen	26.20	-98.23	US	8
Lakhīmpur	27.95	80.78	IN	8
Ishinomaki	38.42	141.30	JP	8
Mpumalanga	-29.81	30.64	ZA	8
Mian Channun	30.44	72.36	PK	8
Ji Paraná	-10.89	-61.95	BR	8
Zaanstad	52.45	4.81	NL	8
Kabin Buri	13.95	101.72	TH	8
Kuwana	35.05	136.67	JP	8
Ayacucho	-13.16	-74.22	PE	8
Shanhaiguan	40.00	119.75	CN	8
Chamartín	40.46	-3.68	ES	8
Şaḩam	24.17	56.89	OM	8
Abéché	13.83	20.83	TD	8
Peristéri	38.02	23.69	GR	8
Amersfoort	52.16	5.39	NL	8
Darwin	-12.46	130.84	AU	8
Jeongeup	35.60	126.92	KR	8
Bellevue	47.61	-122.20	US	8
Korolev	55.91	37.83	RU	8
Valsād	20.61	72.93	IN	8
Shinyanga	-3.66	33.42	TZ	8
Sollentuna	59.43	17.95	SE	8
Al Hindīyah	32.54	44.22	IQ	8
Yaizu	34.87	138.32	JP	8
Payakumbuh	-0.22	100.63	ID	8
Damoh	23.83	79.44	IN	8
Āsela	7.95	39.13	ET	8
Haldwani	29.22	79.53	IN	8
Irewe	6.42	3.14	NG	8
Batang	-6.48	110.71	ID	8
Gbongan	7.48	4.35	NG	8
Gama	-16.03	-48.07	BR	8
Siem Reap	13.36	103.86	KH	8
Anaco	9.43	-64.46	VE	8
Purwodadi	-7.09	110.92	ID	8
Koga	36.18	139.72	JP	8
Yuepu	31.43	121.42	CN	8
Hābra	22.84	88.66	IN	8
Sidoarjo	-7.45	112.72	ID	8
Şabāḩ as Sālim	29.26	48.06	KW	8
Balneário Camboriú	-26.99	-48.63	BR	8
Lausanne	46.52	6.63	CH	8
Choloma	15.61	-87.95	HN	8
Barcarena	-1.51	-48.63	BR	8
Kairouan	35.68	10.10	TN	8
Stockport	53.41	-2.16	GB	8
Huadian	42.97	126.74	CN	8
Crato	-7.23	-39.41	BR	8
Kousséri	12.08	15.03	CM	8
Weru	-6.71	108.50	ID	8
Al-'Ubūr	30.23	31.48	EG	8
Kolpino	59.75	30.59	RU	8
Itapipoca	-3.49	-39.58	BR	8
Conselheiro Lafaiete	-20.66	-43.79	BR	8
Sarh	9.15	18.38	TD	8
Gingoog	8.83	125.10	PH	8
San Juan del Río	20.39	-100.00	MX	8
Sekondi-Takoradi	4.93	-1.76	GH	8
Liuzhi	26.23	105.43	CN	8
Altamira	-3.20	-52.21	BR	8
Fuyu	45.18	124.82	CN	8
Vespasiano	-19.69	-43.92	BR	8
Whitby	43.88	-78.93	CA	8
Metairie	29.98	-90.15	US	8
Chaohu	31.60	117.87	CN	8
Kolār	13.14	78.13	IN	8
Bizerte	37.27	9.87	TN	8
Táriba	7.82	-72.22	VE	8
Ejigbo	7.90	4.31	NG	8
Santa Cruz do Sul	-29.72	-52.43	BR	8
Ksar El Kebir	35.00	-5.90	MA	8
Paris 11 Popincourt	48.86	2.38	FR	8
Dabou	5.33	-4.38	CI	8
Bukit Panjang New Town	1.38	103.76	SG	8
Paris 12 Reuilly	48.84	2.39	FR	8
Bertoua	4.58	13.68	CM	8
Jacmel	18.24	-72.54	HT	8
Srikakulam	18.30	83.90	IN	8
Candelaria	13.93	121.42	PH	8
Vĩnh Long	10.25	105.97	VN	8
Praia	14.93	-23.51	CV	8
Araruama	-22.87	-42.34	BR	8
Resende	-22.47	-44.45	BR	8
Liangping	30.66	107.77	CN	8
Kirdāsah	30.03	31.11	EG	8
Ponce	18.01	-66.62	PR	8
Doilungdêqên	29.66	90.99	CN	8
Jieshi	22.81	115.83	CN	8
Hejiang	28.81	105.83	CN	8
Pasir Puteh	5.83	102.40	MY	8
Mandya	12.52	76.90	IN	8
Xiayang	31.15	121.12	CN	8
Dixinn	9.55	-13.67	GN	8
Bhisho	-32.85	27.44	ZA	8
Subang	-6.57	107.76	ID	8
Madhurampur Dehri	24.97	84.20	IN	8
Negombo	7.21	79.84	LK	8
Irákleion	35.33	25.14	GR	8
Hampton	37.03	-76.35	US	8
Wuyishan	27.76	118.03	CN	8
Miramar	25.99	-80.23	US	8
Bilqās	31.21	31.36	EG	8
Rangkasbitung	-6.36	106.25	ID	8
Odintsovo	55.67	37.28	RU	8
Foggia	41.46	15.55	IT	8
Antsiranana	-12.32	49.29	MG	8
Kānchrāpāra	22.96	88.43	IN	8
San Juan Sacatepéquez	14.72	-90.64	GT	8
Minoh	34.83	135.47	JP	8
Funtua	11.52	7.31	NG	8
St. Catharines	43.17	-79.24	CA	8
Dawei	14.08	98.19	MM	8
Igboho	8.84	3.76	NG	8
Gunungsitoli	1.29	97.61	ID	8
Apeldoorn	52.21	5.97	NL	8
Marīvān	35.52	46.18	IR	8
Phủ Lý	20.55	105.91	VN	8
Divo	5.84	-5.36	CI	8
Huinong	39.23	106.77	CN	8
Ebina	35.38	139.40	JP	8
Larache	35.19	-6.16	MA	8
Varginha	-21.55	-45.43	BR	8
Paris 14 Observatoire	48.83	2.33	FR	8
Būsh	29.15	31.13	EG	8
Mlolongo	-1.40	36.94	KE	8
Guarapari	-20.67	-40.50	BR	8
San José del Cabo	23.05	-109.70	MX	8
West Valley City	40.69	-112.00	US	8
Kisarazu	35.38	139.93	JP	8
Gejiu	23.36	103.15	CN	8
Bacău	46.57	26.91	RO	8
Saaba	12.37	-1.41	BF	8
Mingaladon	16.92	96.10	MM	8
Dimāpur	25.91	93.72	IN	8
Sasolburg	-26.81	27.82	ZA	8
Cheras	3.11	101.73	MY	8
Tasek Glugor	5.48	100.50	MY	8
Osorno	-40.57	-73.13	CL	8
Jiagedaqi	50.42	124.12	CN	8
Tumxuk	39.87	79.06	CN	8
Kushtia	23.90	89.12	BD	8
Pitalito	1.85	-76.05	CO	8
Baliuag	14.95	120.90	PH	8
Hoàn Kiếm	21.03	105.85	VN	8
Kajansi	0.22	32.53	UG	8
Isahaya	32.84	130.04	JP	8
Dayton	39.76	-84.19	US	8
Cẩm Phả Mines	21.02	107.30	VN	8
Petapa	14.50	-90.56	GT	8
Māler Kotla	30.53	75.88	IN	8
Buguma	4.74	6.86	NG	8
Itaituba	-4.28	-55.98	BR	8
Araras	-22.36	-47.38	BR	8
Shiqiao	22.95	113.36	CN	8
Pyay	18.82	95.22	MM	8
Rabak	13.18	32.74	SD	8
Tây Ninh	11.31	106.10	VN	8
Tyre	33.27	35.19	LB	8
Kutaisi	42.27	42.69	GE	8
Andīmeshk	32.46	48.35	IR	8
Siwān	26.22	84.36	IN	8
Madrid	4.73	-74.26	CO	8
Angono	14.53	121.15	PH	8
Cartago	4.75	-75.91	CO	8
Shahreẕā	32.01	51.86	IR	8
Hinthada	17.65	95.46	MM	8
Apucarana	-23.55	-51.46	BR	8
Cap-Haïtien	19.76	-72.20	HT	8
Baturaja	-4.13	104.17	ID	8
Inazawa	35.25	136.78	JP	8
Rodriguez	14.76	121.20	PH	8
Kalol	23.25	72.50	IN	8
Mīāndoāb	36.97	46.11	IR	8
São Mateus	-18.72	-39.86	BR	8
Laghouat	33.80	2.87	DZ	8
Nevinnomyssk	44.63	41.94	RU	8
San Mateo	14.70	121.12	PH	8
Ţahţā	26.77	31.50	EG	8
San Juan	14.60	121.03	PH	8
Sibiu	45.80	24.15	RO	8
Olathe	38.88	-94.82	US	8
El Geneina Fort	13.47	22.46	SD	8
Ikirun	7.91	4.67	NG	8
Shenglilu	29.35	105.88	CN	8
San Nicolás de los Arroyos	-33.33	-60.21	AR	8
Léogâne	18.51	-72.63	HT	8
Adiwerna	-6.94	109.13	ID	8
Cametá	-2.24	-49.50	BR	8
Al Qurnah	31.02	47.43	IQ	8
Abakaliki	6.32	8.11	NG	8
Vitória de Santo Antão	-8.12	-35.29	BR	8
Warren	42.49	-83.01	US	8
Cizre	37.33	42.18	TR	8
Bānkura	23.23	87.07	IN	8
İnegol	40.08	29.51	TR	8
Ebetsu	43.11	141.55	JP	8
Anyama	5.49	-4.05	CI	8
Jiawang	34.43	117.44	CN	8
Singaraja	-8.11	115.09	ID	8
Pātan	23.85	72.13	IN	8
Würzburg	49.79	9.95	DE	8
Barysaw	54.23	28.50	BY	8
Đồng Hới	17.47	106.62	VN	8
Randfontein	-26.18	27.70	ZA	8
Pervouralsk	56.91	59.94	RU	8
Gondā City	27.13	81.95	IN	8
Madīnat Ḩamad	26.12	50.51	BH	8
Ōme	35.78	139.24	JP	8
Sinnūris	29.41	30.87	EG	8
Votorantim	-23.55	-47.44	BR	8
Milagro	-2.13	-79.59	EC	8
Jaú	-22.30	-48.56	BR	8
Thornton	39.87	-104.97	US	8
Valdivia	-39.81	-73.25	CL	8
Olmaliq	40.84	69.60	UZ	8
Okrika	4.74	7.08	NG	8
High Wycombe	51.63	-0.75	GB	8
Carrollton	32.95	-96.89	US	8
Talisay	10.24	123.85	PH	8
Gao	16.27	-0.04	ML	8
Dhaulpur	26.69	77.88	IN	8
Tarime	-1.35	34.37	TZ	8
Milton	43.52	-79.88	CA	8
M'Sila	35.71	4.54	DZ	8
Narita	35.78	140.32	JP	8
Franceville	-1.63	13.58	GA	8
Puqi	29.72	113.88	CN	8
Tondabayashichō	34.50	135.60	JP	8
Sandachō	34.88	135.23	JP	8
Gondiā	21.46	80.19	IN	8
Dunedin	-45.87	170.50	NZ	8
Kislovodsk	43.91	42.72	RU	8
Kyauktan	16.64	96.33	MM	8
Schaerbeek	50.87	4.38	BE	8
Hoofddorp	52.30	4.69	NL	8
Machiques	10.06	-72.55	VE	8
Palakkad	10.77	76.65	IN	8
Silifke	36.38	33.93	TR	8
Charleston	32.78	-79.93	US	8
Langley	49.10	-122.66	CA	8
Midland	32.00	-102.08	US	8
Fujinomiya	35.22	138.62	JP	8
Mingala Tangnyunt	16.79	96.17	MM	8
Innsbruck	47.26	11.39	AT	8
Bragança	-1.05	-46.77	BR	8
Kingston	44.23	-76.48	CA	8
Wugang	26.73	110.63	CN	8
Gloucester	51.87	-2.24	GB	8
Waco	31.55	-97.15	US	8
Zama	35.49	139.39	JP	8
Manokwari	-0.86	134.06	ID	8
Valinhos	-22.97	-47.00	BR	8
Dimitrovgrad	54.21	49.62	RU	8
Zhalantun	48.01	122.74	CN	8
Bettiah	26.80	84.50	IN	8
Maijdi	22.87	91.10	BD	8
San Pedro Garza García	25.66	-100.40	MX	8
Sapucaia do Sul	-29.82	-51.15	BR	8
Kombolcha	11.08	39.74	ET	8
Muricay	7.83	123.48	PH	8
Sterling Heights	42.58	-83.03	US	8
Surat Thani	9.14	99.33	TH	8
Fürth	49.48	10.99	DE	8
Ferrara	44.84	11.62	IT	8
Quận Đức Thịnh	10.31	105.74	VN	8
Isidro Casanova	-34.70	-58.59	AR	8
Ōmuta	33.03	130.45	JP	8
Villa Mercedes	-37.40	-71.98	CL	8
Fuji	29.15	105.37	CN	8
Palwal	28.14	77.33	IN	8
Bielany	52.29	20.94	PL	8
Dawukou	39.04	106.40	CN	8
Bulaon	15.08	120.66	PH	8
Garut	-7.25	107.92	ID	8
Ajdabiya	30.76	20.23	LY	8
Abiko	35.87	140.02	JP	8
Kadoma	34.74	135.57	JP	8
Majie	25.03	102.64	CN	8
Bhakkar	31.63	71.06	PK	8
Kāshmar	35.24	58.47	IR	8
Jijel	36.82	5.76	DZ	8
Martapura	-3.41	114.86	ID	8
Villeurbanne	45.77	4.88	FR	8
Hải Châu	15.92	108.13	VN	8
Limbe	4.02	9.21	CM	8
Rānīganj	23.62	87.13	IN	8
Hepo	23.43	115.83	CN	8
Iranshahr	27.20	60.68	IR	8
Soubré	5.78	-6.59	CI	8
Onomichi	34.42	133.20	JP	8
Denton	33.21	-97.13	US	8
Etah	27.56	78.66	IN	8
Pīlibhīt	28.63	79.80	IN	8
Shangzhi	45.21	128.00	CN	8
Lashio	22.94	97.75	MM	8
Novomoskovsk	54.01	38.29	RU	8
Matsubara	34.57	135.55	JP	8
Abengourou	6.73	-3.50	CI	8
Al Bāb	36.37	37.52	SY	8
Shuangcheng	45.38	126.31	CN	8
Exeter	50.72	-3.53	GB	8
Ho	6.60	0.47	GH	8
Narowal	32.10	74.87	PK	8
Lào Cai	22.49	103.97	VN	8
Al Ajaylat	32.76	12.38	LY	8
Udon Thani	17.42	102.79	TH	8
Baḥarkah	36.32	44.04	IQ	8
Bayan Lepas	5.30	100.26	MY	8
Rajapalayam	9.45	77.55	IN	8
Zipaquirá	5.02	-74.00	CO	8
Jīroft	28.68	57.74	IR	8
Cedar Rapids	42.01	-91.64	US	8
Dongyang	29.27	120.23	CN	8
Nantou	22.72	113.29	CN	8
Botad	22.17	71.67	IN	8
Nablus	32.22	35.25	PS	8
New Haven	41.31	-72.93	US	8
Arcahaie	18.77	-72.51	HT	8
Jiazi	22.88	116.07	CN	8
Foumban	5.73	10.90	CM	8
Roseville	38.75	-121.29	US	8
Quilpué	-33.05	-71.44	CL	8
Rawson	-31.58	-68.54	AR	8
Kati	12.74	-8.07	ML	8
Seri Kembangan	3.03	101.72	MY	8
Colchester	51.89	0.90	GB	8
Umeå	63.83	20.26	SE	8
Din Daeng	13.79	100.57	TH	8
Chaman	30.92	66.45	PK	8
Sennar	13.57	33.57	SD	8
Masaya	11.97	-86.10	NI	8
Visalia	36.33	-119.29	US	8
Nankana Sahib	31.45	73.71	PK	8
Caála	-12.85	15.56	AO	8
Sonārgaon	23.65	90.62	BD	8
Tottenham	51.60	-0.07	GB	8
Aley	33.81	35.60	LB	8
San Martin	-5.19	-80.67	PE	8
Tychy	50.14	18.97	PL	8
Wuda	39.50	106.71	CN	8
Cambridge	43.36	-80.31	CA	8
Mardin	37.31	40.74	TR	8
Zwolle	52.51	6.09	NL	8
Baidoa	3.11	43.65	SO	8
Sầm Sơn	19.73	105.90	VN	8
Santo António	22.20	113.54	CN	8
Salford	53.49	-2.29	GB	8
Mandi Bahauddin	32.59	73.49	PK	8
Tokat	40.31	36.55	TR	8
Ô Môn	10.11	105.62	VN	8
Gapan	15.31	120.95	PH	8
Deoria	26.50	83.78	IN	8
Bayambang	15.81	120.46	PH	8
Mianwali	32.58	71.53	PK	8
Coral Springs	26.27	-80.27	US	8
Sherbrooke	45.40	-71.90	CA	8
Al Bayḑā’	32.76	21.76	LY	8
Sabará	-19.89	-43.81	BR	8
Acilia-Castel Fusano-Ostia Antica	41.76	12.33	IT	8
Thousand Oaks	34.17	-118.84	US	8
Colatina	-19.54	-40.63	BR	8
Győr	47.68	17.64	HU	8
Copiapó	-27.37	-70.33	CL	8
Kokubunji	35.70	139.48	JP	8
Quibdó	5.69	-76.66	CO	8
Guelmim	28.99	-10.06	MA	8
Charallave	10.24	-66.86	VE	8
Shahr-e Kord	32.33	50.86	IR	8
Malambo	10.86	-74.77	CO	8
Tatuí	-23.36	-47.86	BR	8
Iwakuni	34.16	132.22	JP	8
Leiyang	26.40	112.86	CN	8
Białołeka	52.32	20.97	PL	8
Cadiz	10.95	123.29	PH	8
Carnot	4.94	15.88	CF	8
Bat Yam	32.02	34.75	IL	8
Zacatecas	22.77	-102.58	MX	8
Elizabeth	40.66	-74.21	US	8
Daur	26.46	68.32	PK	8
Bingöl	38.88	40.49	TR	8
Sātkhira	22.71	89.07	BD	8
Parung	-6.42	106.73	ID	8
Palo Negro	10.17	-67.54	VE	8
Stamford	41.05	-73.54	US	8
Idlib	35.93	36.63	SY	8
Moanda	-5.93	12.37	CD	8
Sīnah	36.81	43.04	IQ	8
Ōsaki	38.59	140.97	JP	8
Magelang	-7.47	110.22	ID	8
Concord	37.98	-122.03	US	8
Leiria	39.74	-8.81	PT	8
Puno	-15.84	-70.02	PE	8
Kamyshin	50.09	45.41	RU	8
Shuanglonghu	29.72	106.61	CN	8
Nimach	24.46	74.87	IN	8
Kafr ad Dawwār	31.13	30.13	EG	8
Águas Claras	-15.84	-48.03	BR	8
Novocheboksarsk	56.11	47.48	RU	8
Besançon	47.25	6.02	FR	8
Lugazi	0.37	32.94	UG	8
Thành phố Sông Công	21.48	105.84	VN	8
Rosario	13.63	121.22	PH	8
Khardah	22.72	88.38	IN	8
Sakakah	29.97	40.21	SA	8
Khenifra	32.93	-5.66	MA	8
Al Manāqil	14.25	32.99	SD	8
Rustavi	41.56	44.98	GE	8
Manzanillo	20.34	-77.12	CU	8
Yavatmāl	20.39	78.13	IN	8
Hālīsahar	22.93	88.42	IN	8
Serpukhov	54.92	37.42	RU	8
Rionegro	6.16	-75.37	CO	8
Shache	38.42	77.24	CN	8
Khanna	30.71	76.22	IN	8
Koidu	8.64	-10.97	SL	8
Norman	35.22	-97.44	US	8
Mosquera	4.71	-74.23	CO	8
Bento Gonçalves	-29.17	-51.52	BR	8
Buôn Hồ	12.95	108.30	VN	8
Chũ	21.37	106.57	VN	8
Västerås	59.62	16.55	SE	8
Seto	35.23	137.10	JP	8
Titāgarh	22.74	88.37	IN	8
Newcastle under Lyme	53.00	-2.23	GB	8
Opole	50.67	17.93	PL	8
Worcester	-33.65	19.45	ZA	8
Elbląg	54.15	19.41	PL	8
Gaojing	31.32	121.48	CN	8
Sirajganj	24.46	89.71	BD	8
Jequié	-13.86	-40.09	BR	8
Płock	52.55	19.71	PL	8
Siguatepeque	14.60	-87.83	HN	8
Wałbrzych	50.77	16.28	PL	8
Yevlakh	40.62	47.15	AZ	8
Al Manzalah	31.16	31.94	EG	8
Wau	7.70	27.99	SS	8
Songnan	31.35	121.48	CN	8
Athens	33.96	-83.38	US	8
Amaigbo	5.79	7.84	NG	8
Chiang Mai	18.79	98.98	TH	8
Lafia	8.49	8.52	NG	8
Jiangyou	31.77	104.72	CN	8
Cikampek	-6.42	107.46	ID	8
Tengyue	24.99	98.51	CN	8
Shajing	22.75	113.82	CN	8
Jinfeng	28.24	116.60	CN	8
Sancti Spíritus	21.93	-79.44	CU	8
Mataró	41.54	2.44	ES	8
Barretos	-20.56	-48.57	BR	8
Kent	47.38	-122.23	US	8
Pakokku	21.33	95.08	MM	8
Murom	55.57	42.02	RU	8
Sertãozinho	-21.14	-47.99	BR	8
Hāthras	27.60	78.05	IN	8
Pulong Santa Cruz	14.27	121.08	PH	8
Klaten	-7.71	110.61	ID	8
Khasavyurt	43.25	46.59	RU	8
Neftekamsk	56.09	54.26	RU	8
Simi Valley	34.27	-118.78	US	8
Bayawan	9.36	122.80	PH	8
Shakargarh	32.26	75.16	PK	8
Jorhat	26.76	94.20	IN	8
La Victoria	10.23	-67.33	VE	8
Pakpattan	30.34	73.39	PK	8
Jingzhi	36.31	119.39	CN	8
Danshui	22.80	114.47	CN	8
Solihull	52.41	-1.78	GB	8
East Los Angeles	34.02	-118.17	US	8
Lalitpur	24.69	78.42	IN	8
Jombang	-7.55	112.23	ID	8
Maxixe	-23.86	35.35	MZ	8
Nakhon Ratchasima	14.97	102.10	TH	8
Chinandega	12.63	-87.13	NI	8
Al Jadīd	27.05	14.40	LY	8
Lambaré	-25.35	-57.61	PY	8
Macheng	31.18	115.02	CN	8
Iizuka	33.64	130.69	JP	8
Hua Hin	12.57	99.96	TH	8
San Carlos del Zulia	9.00	-71.93	VE	8
Rafaḩ	31.30	34.24	PS	8
Ampang	3.15	101.77	MY	8
Guntakal	15.17	77.36	IN	8
Ālā'ĕr	40.54	81.27	CN	8
Santa Clara	37.35	-121.96	US	8
Pithampur	22.60	75.70	IN	8
Paseh	-7.07	107.79	ID	8
Mothīhāri	26.65	84.92	IN	8
Koganei	35.70	139.51	JP	8
Nossa Senhora de Fátima	22.21	113.55	CN	8
Topeka	39.05	-95.68	US	8
Orléans	45.46	-75.50	CA	8
Paek'ak	39.46	125.61	KP	8
Huicheng	23.04	116.29	CN	8
Puerto Ayacucho	5.66	-67.58	VE	8
Gashua	12.87	11.04	NG	8
Les Cayes	18.19	-73.75	HT	8
Salerno	40.68	14.79	IT	8
Savannakhet	16.57	104.76	LA	8
Munūf	30.47	30.93	EG	8
Watford	51.66	-0.40	GB	8
Giresun	40.92	38.39	TR	8
Xiazhen	34.80	117.11	CN	8
Torbat-e Ḩeydarīyeh	35.27	59.22	IR	8
Chaeryŏng-ni	38.74	125.23	KP	8
Kastamonu	41.38	33.78	TR	8
Kanhangad	12.31	75.11	IN	8
‘Ajlūn	32.33	35.75	JO	8
Derince	40.76	29.81	TR	8
Sukawati	-8.49	115.05	ID	8
Jagdalpur	19.08	82.02	IN	8
Kuopio	62.89	27.68	FI	8
Bang Sue	13.81	100.53	TH	8
Mailsi	29.80	72.17	PK	8
Los Ángeles	-37.47	-72.35	CL	8
Haimen	23.19	116.61	CN	8
Karabük	41.20	32.63	TR	8
Ntuzuma	-29.74	30.95	ZA	8
Tsuruoka	38.72	139.82	JP	8
Saint Peters	51.37	1.42	GB	8
Barbacena	-21.23	-43.77	BR	8
Uruma	26.38	127.86	JP	8
Debre Tabor	11.85	38.02	ET	8
Sakiet ed Daier	34.79	10.81	TN	8
Nzega	-4.22	33.18	TZ	8
Abilene	32.45	-99.73	US	8
Ban Samae Dam	13.59	100.39	TH	8
Shahecheng	36.94	114.51	CN	8
Kumbo	6.20	10.67	CM	8
Ottawa South	45.39	-75.69	CA	8
Willemstad	12.12	-68.89	CW	8
Bălţi	47.76	27.93	MD	8
Dokri	27.37	68.10	PK	8
Az Zulfī	26.30	44.82	SA	8
Sultan Kudarat	7.23	124.26	PH	8
Bet Shemesh	31.73	34.99	IL	8
Jagādhri	30.17	77.30	IN	8
Huixquilucan	19.36	-99.35	MX	8
Arapongas	-23.42	-51.42	BR	8
Semnan	35.58	53.39	IR	8
León	42.60	-5.57	ES	8
San Francisco de Macorís	19.29	-70.25	DO	8
Yuanlin	23.96	120.58	TW	8
Santa Tecla	13.68	-89.28	SV	8
Sorriso	-12.55	-55.71	BR	8
Ciudad Valles	22.00	-99.01	MX	8
Ouahigouya	13.58	-2.42	BF	8
Poblacion	14.38	121.03	PH	8
Kashihara-shi	34.51	135.79	JP	8
Ashmūn	30.30	30.98	EG	8
Ağrı	39.71	43.04	TR	8
Leeuwarden	53.20	5.81	NL	8
Bến Tre	10.24	106.38	VN	8
Monza	45.58	9.27	IT	8
New Mirpur City	33.15	73.75	PK	8
Chía	4.86	-74.06	CO	8
Olanchito	15.48	-86.57	HN	8
Targówek	52.29	21.05	PL	8
Lecheng	25.13	113.35	CN	8
Nancun	36.53	120.13	CN	8
Marand	38.43	45.77	IR	8
As Sinbillāwayn	30.88	31.46	EG	8
Crawley	51.11	-0.18	GB	8
Rudnyy	52.97	63.11	KZ	8
Magangué	9.24	-74.75	CO	8
Itaguaí	-22.85	-43.78	BR	8
Bemowo	52.25	20.91	PL	8
Metz	49.12	6.17	FR	8
Jiupu	41.07	122.95	CN	8
Dārjiling	27.03	88.27	IN	8
Salvaleón de Higüey	18.62	-68.71	DO	8
Thaton	16.92	97.37	MM	8
Kurichchi	10.96	76.97	IN	8
Lumajang	-8.13	113.22	ID	8
Ise	34.48	136.70	JP	8
Hagonoy	14.83	120.73	PH	8
Samandağ	36.08	35.98	TR	8
Caraguatatuba	-23.62	-45.41	BR	8
Birigui	-21.29	-50.34	BR	8
Pinsk	52.12	26.07	BY	8
Telde	27.99	-15.42	ES	8
Indramayu	-6.33	108.32	ID	8
Relizane	35.74	0.56	DZ	8
Bordj el Kiffan	36.75	3.19	DZ	8
Manas	40.94	72.99	KG	8
Kirishima	31.74	130.76	JP	8
Orizaba	18.85	-97.10	MX	8
Toba Tek Singh	30.97	72.48	PK	8
Honmachi	32.50	130.60	JP	8
Wolfsburg	52.42	10.78	DE	8
Umuarama	-23.77	-53.33	BR	8
Niihama	33.96	133.31	JP	8
Jiaohe	43.72	127.33	CN	8
Igarassu	-7.83	-34.91	BR	8
Dos Hermanas	37.28	-5.92	ES	8
Tabuk	17.47	121.47	PH	8
Dam Dam	22.63	88.42	IN	8
Hoima	1.43	31.35	UG	8
Az Zubayr	30.39	47.70	IQ	8
Beppu	33.28	131.50	JP	8
Hardoī	27.39	80.13	IN	8
Behbahān	30.60	50.24	IR	8
Itatiba	-23.01	-46.84	BR	8
Huangzhou	30.45	114.80	CN	8
Puruliya	23.33	86.36	IN	8
Ubon Ratchathani	15.24	104.85	TH	8
Virginia	-28.10	26.87	ZA	8
Brits	-25.63	27.78	ZA	8
Recklinghausen	51.61	7.20	DE	8
Xiulin	29.72	112.40	CN	8
Zhoucun	36.82	117.82	CN	8
Cherkessk	44.22	42.05	RU	8
Haveli Lakha	30.45	73.69	PK	8
Maastricht	50.85	5.69	NL	8
Amherst	42.98	-78.80	US	8
Tekirdağ	40.98	27.51	TR	8
Shahr-e Ṣadrā	29.80	52.50	IR	8
Victorville	34.54	-117.29	US	8
Burton upon Trent	52.81	-1.64	GB	8
Calumpit	14.92	120.77	PH	8
Lat Phrao	13.80	100.61	TH	8
Göttingen	51.53	9.93	DE	8
Titiwangsa	3.18	101.70	MY	8
Phasi Charoen	13.71	100.44	TH	8
Zābol	31.03	61.49	IR	8
Kaya	13.09	-1.08	BF	8
Xiangcheng	25.47	100.56	CN	8
Dharmavaram	14.41	77.72	IN	8
Ādīgrat	14.28	39.46	ET	8
Kotamobagu	0.74	124.31	ID	8
Carora	10.17	-70.08	VE	8
Vallejo	38.10	-122.26	US	8
Bhadreswar	22.82	88.34	IN	8
Dorūd	33.49	49.06	IR	8
Bern	46.95	7.45	CH	8
San Pedro de la Paz	-36.84	-73.10	CL	8
Nagaon	26.35	92.67	IN	8
Lahti	60.98	25.66	FI	8
Vejalpur	22.69	73.56	IN	8
Longshui	29.57	105.76	CN	8
Siracusa	37.08	15.29	IT	8
Mubende	0.56	31.39	UG	8
Stara Zagora	42.43	25.64	BG	8
Ondjiva	-17.07	15.73	AO	8
Alberton	-26.27	28.12	ZA	8
Chikmagalūr	13.32	75.77	IN	8
Ekibastuz	51.72	75.32	KZ	8
Algeciras	36.13	-5.45	ES	8
Lafayette	30.22	-92.02	US	8
Lianhe	47.13	129.27	CN	8
Chico	39.73	-121.84	US	8
Bhadrak	21.05	86.52	IN	8
Bagé	-31.33	-54.11	BR	8
North Stamford	41.14	-73.54	US	8
Bergamo	45.70	9.67	IT	8
Ruse	43.85	25.95	BG	8
Sawai Madhopur	26.02	76.34	IN	8
Chơn Thành	11.43	106.64	VN	8
Ambikāpur	23.12	83.20	IN	8
Eunápolis	-16.38	-39.58	BR	8
Apalit	14.95	120.77	PH	8
Hartford	41.76	-72.69	US	8
Bukittinggi	-0.31	100.37	ID	8
Dolisie	-4.20	12.67	CG	8
Ejido	8.55	-71.24	VE	8
Berkeley	37.87	-122.27	US	8
Xilin Hot	43.97	116.03	CN	8
Nova Lima	-19.99	-43.85	BR	8
Plaridel	14.89	120.86	PH	8
West Palm Beach	26.72	-80.05	US	8
Kashiwara	34.45	135.77	JP	8
Uruguaiana	-29.75	-57.09	BR	8
Ikoma	34.68	135.70	JP	8
Heilbronn	49.14	9.22	DE	8
El Mourouj	36.71	10.21	TN	8
Ţūz Khūrmātū	34.89	44.63	IQ	8
Trento	46.07	11.12	IT	8
Shahdad Kot	27.85	67.91	PK	8
Catchiungo	-12.57	16.23	AO	8
Ingolstadt	48.77	11.42	DE	8
Guará	-15.81	-47.97	BR	8
Lichuan	30.30	108.85	CN	8
Bukit Bintang	3.15	101.71	MY	8
La Concepción	10.62	-71.84	VE	8
Ulm	48.40	9.99	DE	8
Mandoli	28.70	77.31	IN	8
San Carlos	9.66	-68.59	VE	8
Włocławek	52.65	19.07	PL	8
Allentown	40.61	-75.49	US	8
Satara	17.69	73.99	IN	8
Bao'an Centre	22.58	113.92	CN	8
Charsadda	34.15	71.74	PK	8
Fernando de la Mora	-25.34	-57.52	PY	8
Chūru	28.30	74.97	IN	8
Perugia	43.11	12.39	IT	8
Gangāpur	26.47	76.72	IN	8
Zhujing	30.90	121.16	CN	8
Guelma	36.46	7.43	DZ	8
Zhaoyuan	37.36	120.41	CN	8
Nabatîyé et Tahta	33.38	35.48	LB	8
Rustaq	23.39	57.42	OM	8
Orekhovo-Zuyevo	55.81	38.99	RU	8
Gereida	11.28	25.14	SD	8
Cabudwaaq	6.25	46.22	SO	8
Cheremushky	46.43	30.71	UA	8
Madhyapur Thimi	27.68	85.39	NP	8
Saint-Louis-de-Terrebonne	45.70	-73.79	CA	8
Evansville	37.97	-87.56	US	8
Bonon	6.93	-6.05	CI	8
Bottrop	51.52	6.93	DE	8
Ghotki	28.00	69.32	PK	8
Kwekwe	-18.93	29.81	ZW	8
Malindi	-3.22	40.12	KE	8
Ban I Chang	13.71	99.90	TH	8
Rize	41.02	40.52	TR	8
Almirante Tamandaré	-25.32	-49.31	BR	8
Palm Bay	28.03	-80.59	US	8
Ann	19.80	94.05	MM	8
Leiden	52.16	4.49	NL	8
Thon Buri	13.72	100.49	TH	8
Ajax	43.85	-79.03	CA	8
Sambrial	32.48	74.35	PK	8
Pescara	42.46	14.20	IT	8
Modakeke	7.38	4.26	NG	8
Nobeoka	32.58	131.67	JP	8
Silang	14.22	120.97	PH	8
Amanfrom	5.54	-0.40	GH	8
Marituba	-1.36	-48.34	BR	8
Paulo Afonso	-9.41	-38.21	BR	8
Moḩammad Shahr	35.76	50.92	IR	8
Īz̄eh	31.83	49.87	IR	8
Nazilli	37.92	28.32	TR	8
Daitō	34.71	135.62	JP	8
Hòa Cường	16.04	108.18	VN	8
Lira	2.25	32.90	UG	8
Pforzheim	48.88	8.70	DE	8
Salihli	38.48	28.15	TR	8
Port Dickson	2.52	101.80	MY	8
Berkane	34.92	-2.32	MA	8
Dordrecht	51.81	4.67	NL	8
Battambang	13.10	103.20	KH	8
Offenbach	50.10	8.77	DE	8
Kitami	43.80	143.89	JP	8
Vĩnh Yên	21.31	105.60	VN	8
Madhavaram	13.15	80.23	IN	8
Cagua	10.19	-67.46	VE	8
Fujairah	25.12	56.34	AE	8
Mandimba	-14.35	35.65	MZ	8
Reykjavík	64.14	-21.90	IS	8
Dohad	22.83	74.26	IN	8
Cheltenham	51.90	-2.08	GB	8
Huaraz	-9.53	-77.53	PE	8
Santa Coloma de Gramenet	41.45	2.21	ES	8
Santana	-0.04	-51.17	BR	8
Araxá	-19.59	-46.94	BR	8
Piraquara	-25.44	-49.07	BR	8
Barshi	18.23	75.69	IN	8
Lhasa	29.65	91.10	CN	8
Bắc Quang	22.48	104.87	VN	8
Xunchang	28.45	104.71	CN	8
Hưng Yên	20.65	106.05	VN	8
Miramar	22.36	-97.90	MX	8
Bremerhaven	53.55	8.58	DE	8
Queenstown	-31.90	26.88	ZA	8
Nanbin	30.00	108.11	CN	8
Bandar-e Anzalī	37.47	49.46	IR	8
Khlong Luang	14.06	100.65	TH	8
Ādilābād	19.67	78.54	IN	8
Fargo	46.88	-96.79	US	8
Brugge	51.21	3.22	BE	8
Jhunjhunūn	28.13	75.40	IN	8
Iguala de la Independencia	18.35	-99.54	MX	8
Sarandi	-23.44	-51.87	BR	8
Zomba	-15.39	35.32	MW	8
Sepatan	-6.12	106.58	ID	8
Malita	6.42	125.61	PH	8
Zielona Góra	51.94	15.51	PL	8
Luodian	31.42	121.33	CN	8
Jetpur	21.75	70.62	IN	8
Uppal Kalan	17.41	78.56	IN	8
São Lourenço da Mata	-8.00	-35.02	BR	8
Maghāghah	28.65	30.84	EG	8
Pita Kotte	6.89	79.90	LK	8
Guiguinto	14.83	120.88	PH	8
Gudivāda	16.44	81.00	IN	8
Setúbal	38.52	-8.89	PT	8
Torrejón de Ardoz	40.46	-3.47	ES	8
Aizu-Wakamatsu	37.49	139.95	JP	8
Bama	11.52	13.69	NG	8
Ilobu	7.84	4.49	NG	8
Manolo Fortich	8.37	124.86	PH	8
Itabira	-19.62	-43.23	BR	8
Kiến An	20.81	106.63	VN	8
Jandira	-23.53	-46.90	BR	8
Guaratinguetá	-22.82	-45.19	BR	8
San Rafael	-34.62	-68.33	AR	8
Shaoshan	27.92	112.52	CN	8
Nghi Xuân	18.66	105.75	VN	8
Bārān	25.10	76.52	IN	8
Narmadapuram	22.75	77.73	IN	8
Amreli	21.60	71.21	IN	8
Nakhon Pathom	13.82	100.04	TH	8
Manfalūţ	27.31	30.97	EG	8
Kakegawa	34.77	138.02	JP	8
Handa	34.88	136.93	JP	8
Wushan	31.08	109.88	CN	8
Abomey	7.18	1.99	BJ	8
Sokodé	8.98	1.13	TG	8
Araguari	-18.65	-48.19	BR	8
Tarnów	50.01	20.99	PL	8
Bangkok Noi	13.76	100.48	TH	8
Jalingo	8.89	11.36	NG	8
Saanich	48.55	-123.37	CA	8
Ibanda	-0.13	30.50	UG	8
Nyíregyháza	47.96	21.72	HU	8
Sano	36.32	139.58	JP	8
Karatsu	33.44	129.97	JP	8
Achinsk	56.27	90.50	RU	8
Pudukkottai	10.38	78.82	IN	8
Shunyi	40.12	116.65	CN	8
Rotherham	53.43	-1.36	GB	8
Ciudad de Villa de Álvarez	19.27	-103.74	MX	8
Rouiba	36.74	3.28	DZ	8
Banyuwangi	-8.23	114.36	ID	8
Tebingtinggi	3.33	99.16	ID	8
Tigwav	18.43	-72.87	HT	8
Narasaraopet	16.23	80.05	IN	8
Lisala	2.15	21.52	CD	8
Badin	24.66	68.84	PK	8
Banfora	10.64	-4.75	BF	8
Punta Arenas	-53.16	-70.91	CL	8
Kadoma	-18.33	29.92	ZW	8
Midsayap	7.19	124.53	PH	8
Camboriú	-27.03	-48.65	BR	8
Pyin Oo Lwin	22.04	96.46	MM	8
Clearwater	27.97	-82.80	US	8
Himamaylan	10.10	122.87	PH	8
Independence	39.09	-94.42	US	8
Heroica Guaymas	27.92	-110.90	MX	8
Kedungwuni	-6.97	109.65	ID	8
Ilebo	-4.33	20.59	CD	8
Kristiansand	58.15	8.00	NO	8
Longjing	42.77	129.42	CN	8
Kroonstad	-27.65	27.23	ZA	8
Remscheid	51.18	7.19	DE	8
Billings	45.78	-108.50	US	8
Möng Yang	21.85	99.68	MM	8
Čačak	43.89	20.35	RS	8
Ann Arbor	42.28	-83.74	US	8
Los Baños	14.17	121.24	PH	8
Duekoué	6.74	-7.35	CI	8
Higashikurume	35.75	139.51	JP	8
Rishra	22.72	88.35	IN	8
Pinhais	-25.44	-49.19	BR	8
Kyzyl	51.71	94.44	RU	8
Cadiz	36.53	-6.29	ES	8
Dąbrowa Górnicza	50.33	19.20	PL	8
Passos	-20.72	-46.61	BR	8
Fāqūs	30.73	31.80	EG	8
Tacurong	6.69	124.68	PH	8
Hōfu	34.05	131.57	JP	8
Gabela	-10.85	14.38	AO	8
Funza	4.72	-74.21	CO	8
Merauke	-8.50	140.41	ID	8
Baripāda	21.93	86.73	IN	8
Kōnosu	36.07	139.52	JP	8
Soreang	-7.03	107.52	ID	8
Dinaig	7.17	124.21	PH	8
Manp’o	41.15	126.29	KP	8
Muktsar	30.47	74.52	IN	8
El Monte	34.07	-118.03	US	8
Tubarão	-28.47	-49.01	BR	8
Forlì	44.22	12.04	IT	8
Azamgarh	26.07	83.18	IN	8
Masaka	-0.33	31.73	UG	8
Cờ Đỏ	10.09	105.43	VN	8
Taldykorgan	45.02	78.37	KZ	8
Gulin	28.04	105.81	CN	8
Thung Khru	13.63	100.51	TH	8
Barnāla	30.37	75.55	IN	8
Yelahanka	13.10	77.60	IN	8
Pattaya	12.93	100.88	TH	8
Chittorgarh	24.89	74.62	IN	8
Chenggu	33.15	107.33	CN	8
Orléans	47.90	1.90	FR	8
Rouen	49.44	1.10	FR	8
Tinsukia	27.49	95.36	IN	8
Westminster	39.84	-105.04	US	8
Dasha	23.11	113.44	CN	8
Yakeshi	49.28	120.73	CN	8
Makumbako	-8.85	34.83	TZ	8
Khargone	21.82	75.61	IN	8
Mariara	10.30	-67.72	VE	8
Digos	6.75	125.36	PH	8
Tshilenge	-10.97	22.90	CD	8
Aïn Beïda	35.80	7.39	DZ	8
Shahre Jadide Andisheh	35.68	51.02	IR	8
Breves	-1.68	-50.48	BR	8
Alcobendas	40.55	-3.64	ES	8
Kissidougou	9.18	-10.10	GN	8
San Tung Chung Hang	22.28	113.94	HK	8
Round Rock	30.51	-97.68	US	8
Noginsk	55.86	38.45	RU	8
Tinaquillo	9.92	-68.30	VE	8
Wilmington	34.24	-77.95	US	8
Cavite City	14.48	120.90	PH	8
Formosa	-15.54	-47.33	BR	8
Tandil	-37.33	-59.14	AR	8
Zoetermeer	52.06	4.49	NL	8
São Gonçalo do Amarante	-5.79	-35.33	BR	8
Sri Jayewardenepura Kotte	6.88	79.91	LK	8
Nasushiobara	36.98	140.07	JP	8
Catanduva	-21.14	-48.97	BR	8
Várzea Paulista	-23.21	-46.83	BR	8
Baisha	29.06	106.12	CN	8
Banī Mazār	28.49	30.81	EG	8
Taunsa	30.70	70.65	PK	8
Urasoe	26.26	127.73	JP	8
Yelets	52.61	38.51	RU	8
Suan Luang	13.73	100.65	TH	8
Parla	40.24	-3.77	ES	8
Mỹ Hào	20.92	106.08	VN	8
Anliu	23.70	115.68	CN	8
Ribeirão Pires	-23.71	-46.41	BR	8
Recanto das Emas	-15.91	-48.06	BR	8
Chunga	-15.32	28.27	ZM	8
Novo-Peredelkino	55.65	37.34	RU	8
Baidyabāti	22.78	88.33	IN	8
Okigwe	5.83	7.35	NG	8
Ar Rifā‘	26.13	50.55	BH	8
Uzhhorod	48.62	22.29	UA	8
Kasese	0.18	30.08	UG	8
Lengshuijiang	27.69	111.43	CN	8
Tianfu	37.26	122.05	CN	8
Arvada	39.80	-105.09	US	8
Otaru	43.19	141.00	JP	8
Tayabas	14.03	121.59	PH	8
Inkisi	-5.13	15.05	CD	8
Iriga City	13.43	123.41	PH	8
Vacoas	-20.30	57.48	MU	8
Beaumont	30.09	-94.10	US	8
Vlorë	40.47	19.48	AL	8
Sanxia	24.93	121.37	TW	8
Provo	40.23	-111.66	US	8
Bastī	26.79	82.72	IN	8
Ezeiza	-34.85	-58.52	AR	8
Xiva	41.39	60.36	UZ	8
Amasya	40.65	35.83	TR	8
Mendoza	-32.89	-68.85	AR	8
Balkh	36.76	66.90	AF	8
Cubatão	-23.89	-46.43	BR	8
Mingshui	36.72	117.50	CN	8
Phong Điền	16.58	107.36	VN	8
Nova Serrana	-19.88	-44.98	BR	8
Wang Thonglang	13.79	100.61	TH	8
Carlsbad	33.16	-117.35	US	8
Mandera	3.94	41.86	KE	8
Qiaotou	36.94	101.67	CN	8
Gyumri	40.79	43.85	AM	8
Silopi	37.24	42.46	TR	8
Gangavati	15.43	76.53	IN	8
Ambur	12.79	78.72	IN	8
Tangará da Serra	-14.62	-57.49	BR	8
Gorzów Wielkopolski	52.73	15.23	PL	8
Simões Filho	-12.78	-38.40	BR	8
Giridih	24.19	86.31	IN	8
Phool Nagar	31.20	73.95	PK	8
Quezon	7.73	125.10	PH	8
Aryanah	36.86	10.19	TN	8
Tungipara	22.90	89.90	BD	8
Ichinoseki	38.92	141.13	JP	8
Khenchela	35.44	7.14	DZ	8
Khon Kaen	16.45	102.83	TH	8
Odessa	31.85	-102.37	US	8
Catalão	-18.17	-47.95	BR	8
Tando Muhammad Khan	25.12	68.54	PK	8
Somaroboro	-25.35	28.83	ZA	8
Guadalajara de Buga	3.90	-76.30	CO	8
Pamanukan	-6.28	107.81	ID	8
Codó	-4.46	-43.89	BR	8
Pardīs	35.75	51.81	IR	8
Pleiku	13.98	108.00	VN	8
Downey	33.94	-118.13	US	8
Lower Hutt	-41.22	174.92	NZ	8
Yuyao	30.05	121.15	CN	8
Rānyah	36.26	44.88	IQ	8
Hatsukaichi	34.35	132.33	JP	8
Tung Chung	22.29	113.94	HK	8
Salto	-31.39	-57.96	UY	8
Siirt	37.93	41.94	TR	8
Zhaozhou	45.71	125.27	CN	8
Punta Cardón	11.66	-70.22	VE	8
Akishima	35.72	139.38	JP	8
Itacoatiara	-3.14	-58.44	BR	8
Chililabombwe	-12.36	27.82	ZM	8
Rivière-des-Prairies–Pointe-aux-Trembles	45.64	-73.58	CA	8
Worthing	50.82	-0.38	GB	8
Navojoa	27.07	-109.44	MX	8
Offa	8.15	4.72	NG	8
Tobolsk	58.20	68.25	RU	8
Tōkai	35.02	136.91	JP	8
Wardha	20.74	78.60	IN	8
Wansheng	28.96	106.93	CN	8
Pattoki	31.02	73.85	PK	8
Wayaobu	37.14	109.66	CN	8
Hikone	35.25	136.25	JP	8
Nagahama	35.38	136.27	JP	8
Pingshan	22.99	114.71	CN	8
Songyuan	45.13	124.83	CN	8
Maba	24.68	113.60	CN	8
Fujimino	35.90	139.52	JP	8
Doncaster	53.52	-1.13	GB	8
Bình Thủy	10.07	105.74	VN	8
Dumaguete	9.31	123.31	PH	8
Jaén	37.77	-3.79	ES	8
Chengqiao	31.63	121.39	CN	8
Chorzów	50.31	18.97	PL	8
Louga	15.62	-16.22	SN	8
Hoàng Mai	19.27	105.72	VN	8
Kamsar	10.65	-14.62	GN	8
Yaritagua	10.08	-69.12	VE	8
Shahdadpur	25.93	68.62	PK	8
Khwisero	0.17	34.59	KE	8
Costa Mesa	33.64	-117.92	US	8
Jauharabad	32.29	72.28	PK	8
Miami Gardens	25.94	-80.25	US	8
Chesterfield	53.25	-1.42	GB	8
North Peoria	40.72	-89.58	US	8
Shchyolkovo	55.92	37.97	RU	8
Al Fashn	28.82	30.90	EG	8
Fairfield	38.25	-122.04	US	8
Guanabacoa	23.13	-82.30	CU	8
Hammanskraal	-25.41	28.29	ZA	8
Ōshū	39.14	141.17	JP	8
Taourirt	34.41	-2.90	MA	8
Ţalkhā	31.05	31.38	EG	8
Neili	24.97	121.26	TW	8
Vihari	30.04	72.36	PK	8
Taonan	45.33	122.78	CN	8
Youkaichi	35.12	136.20	JP	8
Kazo	36.12	139.60	JP	8
Santa Lucía Cotzumalguapa	14.34	-91.02	GT	8
Jönköping	57.78	14.16	SE	8
Tadepalligudem	16.81	81.53	IN	8
Lansing	42.73	-84.56	US	8
Chanduasi	28.45	78.78	IN	8
Bagaha	27.10	84.09	IN	8
Nefteyugansk	61.10	72.60	RU	8
Reutlingen	48.49	9.20	DE	8
Upata	8.02	-62.41	VE	8
Shaowu	27.34	117.48	CN	8
Mengmao	24.00	97.86	CN	8
Lawang	-7.84	112.69	ID	8
Bouskoura	33.45	-7.65	MA	8
Satu Mare	47.80	22.86	RO	8
Itanhaém	-24.18	-46.79	BR	8
Kisii	-0.68	34.77	KE	8
Petržalka	48.12	17.13	SK	8
Kāzerūn	29.62	51.65	IR	8
Achalpur	21.26	77.51	IN	8
Guanare	9.04	-69.73	VE	8
Wuzhishan	18.78	109.50	CN	8
Gondal	21.96	70.80	IN	8
Chichawatni	30.53	72.69	PK	8
Farīdpur	23.61	89.84	BD	8
Apopa	13.81	-89.18	SV	8
Carmona	14.31	121.06	PH	8
Laoag	18.20	120.60	PH	8
Elgin	42.04	-88.28	US	8
Dharashiv	18.18	76.04	IN	8
Xigang	38.55	106.35	CN	8
Chóngfú	30.53	120.43	CN	8
Taipa	22.16	113.56	MO	8
Port Blair	11.67	92.75	IN	8
Minatitlán	18.00	-94.56	MX	8
Esuk Oron	4.80	8.25	NG	8
Atbara	17.70	33.99	SD	8
Vicenza	45.55	11.55	IT	8
Ciudad Guzmán	19.70	-103.46	MX	8
Ballarat	-37.57	143.85	AU	8
Tocoa	15.68	-86.00	HN	8
West Jordan	40.61	-111.94	US	8
Bagalkot	16.19	75.70	IN	8
Lomas de Zamora	-34.76	-58.40	AR	8
Yeoju	37.30	127.63	KR	8
Dūmā	33.57	36.40	SY	8
Winterthur	47.51	8.72	CH	8
Novokuybyshevsk	53.10	49.94	RU	8
Bou Saâda	35.21	4.17	DZ	8
Abnūb	27.27	31.15	EG	8
Qūchān	37.11	58.51	IR	8
Manacapuru	-3.30	-60.62	BR	8
Kuningan	-6.98	108.48	ID	8
Suriāpet	17.14	79.62	IN	8
Kandy	7.29	80.63	LK	8
Zefta	30.71	31.24	EG	8
Bangaon	23.05	88.83	IN	8
Inglewood	33.96	-118.35	US	8
Kilis	36.72	37.12	TR	8
Terrebonne	45.70	-73.65	CA	8
Set Ka Lay	16.81	96.11	MM	8
Chelmsford	51.74	0.47	GB	8
Chiquimula	14.80	-89.55	GT	8
Cileunyi	-6.94	107.75	ID	8
Ashoknagar Kalyangarh	22.86	88.64	IN	8
Mongu	-15.25	23.13	ZM	8
Mulhouse	47.75	7.33	FR	8
Al Fqih Ben Çalah	32.50	-6.69	MA	8
Pulilan	14.90	120.85	PH	8
Beau Bassin-Rose Hill	-20.23	57.47	MU	8
Tuscaloosa	33.21	-87.57	US	8
Sogamoso	5.71	-72.93	CO	8
Mbale	1.08	34.18	UG	8
Montreuil	48.86	2.44	FR	8
Terni	42.56	12.64	IT	8
Deesa	24.26	72.18	IN	8
Navadwīp	23.41	88.37	IN	8
Maran	3.59	102.77	MY	8
Nandurbar	21.37	74.24	IN	8
Kasuga	33.53	130.46	JP	8
Nsukka	6.86	7.40	NG	8
Nguru	12.88	10.46	NG	8
Mabopane	-25.51	28.06	ZA	8
Namur	50.47	4.87	BE	8
Cambé	-23.28	-51.28	BR	8
Encheng	22.19	112.30	CN	8
Turhal	40.39	36.08	TR	8
Gò Vấp	10.82	106.68	VN	8
Richardson	32.95	-96.73	US	8
Bokhtar	37.84	68.78	TJ	8
Hadejia	12.45	10.04	NG	8
Zhuji	29.72	120.24	CN	8
Perpignan	42.70	2.90	FR	8
Lowell	42.63	-71.32	US	8
Lavras	-21.25	-45.00	BR	8
São Pedro da Aldeia	-22.84	-42.10	BR	8
Caen	49.19	-0.36	FR	8
Açailândia	-4.95	-47.50	BR	8
Borāzjān	29.27	51.22	IR	8
Yenangyaung	20.47	94.87	MM	8
Gresham	45.50	-122.43	US	8
Antioch	38.00	-121.81	US	8
Paulínia	-22.76	-47.15	BR	8
Manzini	-26.50	31.38	SZ	8
St. John's	47.56	-52.71	CA	8
Masindi	1.67	31.71	UG	8
Kfar Saba	32.17	34.91	IL	8
Matsutō	36.52	136.57	JP	8
Cambridge	42.38	-71.11	US	8
Sultānpur	26.26	82.07	IN	8
Delhi Cantonment	28.60	77.13	IN	8
Firozpur	30.93	74.61	IN	8
Bayugan	8.76	125.77	PH	8
High Point	35.96	-80.01	US	8
Datun	34.81	116.90	CN	8
Manchester	43.00	-71.45	US	8
Bāneh	36.00	45.89	IR	8
Kresek	-6.13	106.38	ID	8
Bender	46.83	29.48	MD	8
Mbombela	-25.48	30.97	ZA	8
Sembawang Estate	1.45	103.83	SG	8
Gabès	33.88	10.10	TN	8
Orkney	-26.98	26.67	ZA	8
Qingnian	36.84	115.71	CN	8
Temecula	33.49	-117.15	US	8
Lucapa	-8.42	20.74	AO	8
Qal‘at Sukkar	31.86	46.07	IQ	8
An Nu‘mānīyah	32.56	45.41	IQ	8
Kufa	32.05	44.44	IQ	8
Ressano Garcia	-25.44	32.00	MZ	8
Noyabrsk	63.19	75.44	RU	8
Sengerema	-2.67	32.65	TZ	8
Bataysk	47.14	39.76	RU	8
Pisa	43.71	10.40	IT	8
Linshui	36.42	114.20	CN	8
Kamagaya	35.77	140.00	JP	8
Sutton Coldfield	52.57	-1.82	GB	8
Hailun	47.45	126.92	CN	8
Maramag	7.76	125.01	PH	8
Kecskemét	46.91	19.69	HU	8
Seversk	56.60	84.89	RU	8
Ciamis	-7.33	108.35	ID	8
Murrieta	33.55	-117.21	US	8
Brovary	50.51	30.79	UA	8
Santo Antônio de Jesus	-12.97	-39.26	BR	8
Lak Si	13.89	100.58	TH	8
Wakefield	53.68	-1.50	GB	8
Centennial	39.58	-104.88	US	8
Shilong	23.11	113.85	CN	8
Thới Lai	10.07	105.56	VN	8
Sejoumi	36.76	10.12	TN	8
Pandit Deen Dayal Upadhyaya Nagar	25.28	83.12	IN	8
Didao	45.35	130.84	CN	8
Arsuz	36.41	35.89	TR	8
Pelabuhanratu	-6.99	106.55	ID	8
Marugame	34.28	133.78	JP	8
Habikino	34.55	135.59	JP	8
Arzamas	55.40	43.84	RU	8
Phalaborwa	-23.94	31.14	ZA	8
Walthamstow	51.59	-0.02	GB	8
Pueblo	38.25	-104.61	US	8
Ijebu-Igbo	6.97	4.00	NG	8
Sergiyev Posad	56.31	38.14	RU	8
San Juan	-31.54	-68.53	AR	8
Sehore	23.20	77.08	IN	8
Jianchang	27.56	116.64	CN	8
Hulan	45.89	126.58	CN	8
Matagalpa	12.93	-85.92	NI	8
Khlong Toei	13.71	100.58	TH	8
Leninsk-Kuznetsky	54.66	86.17	RU	8
Kiryū	36.40	139.33	JP	8
Handeni	-5.43	38.02	TZ	8
Balombo	-12.35	14.77	AO	8
Zhongxiang	31.17	112.58	CN	8
Thunder Bay	48.38	-89.25	CA	8
Iwatsuki	35.96	139.70	JP	8
Pearland	29.56	-95.29	US	8
Dehui	44.54	125.69	CN	8
Pangkalanbuun	-2.68	111.63	ID	8
Waterbury	41.56	-73.05	US	8
Greeley	40.42	-104.71	US	8
Boulogne-Billancourt	48.84	2.24	FR	8
Warīsān	25.17	55.41	AE	8
Kalisz	51.76	18.09	PL	8
Baia Mare	47.66	23.57	RO	8
Coronel Fabriciano	-19.52	-42.63	BR	8
Mascara	35.40	0.14	DZ	8
Maranguape	-3.89	-38.69	BR	8
Uromi	6.70	6.33	NG	8
Katumba	-9.23	33.62	TZ	8
Móng Cái	21.52	107.97	VN	8
Kanpur Cantonment	26.46	80.38	IN	8
Komatsu	36.40	136.45	JP	8
West Covina	34.07	-117.94	US	8
Enterprise	36.03	-115.24	US	8
Bānsbāria	22.95	88.40	IN	8
Girón	7.07	-73.17	CO	8
Baghlān	36.13	68.71	AF	8
Muriaé	-21.13	-42.37	BR	8
Hanjia	29.30	108.16	CN	8
Trincomalee	8.58	81.23	LK	8
Santiago	16.69	121.55	PH	8
Taibai	30.82	108.36	CN	8
Dagenham	51.55	0.17	GB	8
Xuyong	28.17	105.43	CN	8
North Charleston	32.85	-79.97	US	8
Sohar	24.35	56.71	OM	8
Nehe	48.48	124.87	CN	8
Oktyabrsky	54.48	53.47	RU	8
Tadpatri	14.91	78.01	IN	8
Birnin Kebbi	12.45	4.20	NG	8
Santa Cruz	14.28	121.42	PH	8
Everett	47.98	-122.20	US	8
An Nuhūd	12.70	28.43	SD	8
Ŭllyul	38.51	125.19	KP	8
Rijeka	45.33	14.44	HR	8
Douliu	23.71	120.54	TW	8
Luis Eduardo Magalhães	-12.09	-45.79	BR	8
Catbalogan	11.78	124.89	PH	8
College Station	30.63	-96.33	US	8
As Salţ	32.04	35.73	JO	8
Mishima	35.12	138.92	JP	8
Baía Farta	-12.60	13.20	AO	8
Jalpāiguri	26.52	88.73	IN	8
Jalai Nur	49.45	117.70	CN	8
Tajimi	35.32	137.13	JP	8
Castelar	-34.65	-58.64	AR	8
Pompano Beach	26.24	-80.12	US	8
Coronel	-37.03	-73.14	CL	8
Bacabal	-4.23	-44.78	BR	8
Novo Gama	-16.06	-48.04	BR	8
Dusit	13.78	100.52	TH	8
Mandurah	-32.53	115.72	AU	8
Basingstoke	51.26	-1.09	GB	8
Bandırma	40.35	27.98	TR	8
Maidstone	51.27	0.52	GB	8
Tieli	46.98	128.05	CN	8
Umm Qaşr	30.04	47.92	IQ	8
Butterworth	5.40	100.36	MY	8
Shaping	22.77	112.96	CN	8
Labé	11.32	-12.28	GN	8
Chālūs	36.66	51.42	IR	8
Koszalin	54.19	16.17	PL	8
Bolzano	46.49	11.34	IT	8
South Fulton	33.59	-84.67	US	8
Ubá	-21.12	-42.94	BR	8
Sherpur	25.02	90.02	BD	8
Obninsk	55.11	36.61	RU	8
Girardot City	4.30	-74.81	CO	8
Koblenz	50.35	7.58	DE	8
Itaperuna	-21.20	-41.89	BR	8
Siegen	50.87	8.02	DE	8
Mangalagiri	16.43	80.57	IN	8
Thohoyandou	-22.95	30.48	ZA	8
As Suwayq	23.85	57.44	OM	8
Norwalk	33.90	-118.08	US	8
Yên Vinh	18.67	105.67	VN	8
Mitrovicë	42.88	20.87	XK	8
Yevpatoriya	45.20	33.37	UA	8
Pati	-6.76	111.04	ID	8
Elista	46.31	44.26	RU	8
Dera Murad Jamali	28.55	68.22	PK	8
Taungoo	18.94	96.43	MM	8
Bedford	52.13	-0.47	GB	8
Bagong Silangan	14.71	121.11	PH	8
Kangnyŏng	37.91	125.51	KP	8
Catia La Mar	10.61	-67.03	VE	8
Boulder	40.01	-105.27	US	8
Anning	24.92	102.48	CN	8
Rayong	12.68	101.26	TH	8
Sirte	31.21	16.59	LY	8
Kotri	25.37	68.31	PK	8
Cherëmushki	55.66	37.56	RU	8
Broken Arrow	36.05	-95.79	US	8
Daly City	37.71	-122.46	US	8
Cikarang	-6.26	107.15	ID	8
Arlit	18.74	7.39	NE	8
Bahārestān	32.49	51.77	IR	8
Ba Đồn	17.75	106.42	VN	8
Ranebennur	14.62	75.63	IN	8
Longjiang	47.34	123.20	CN	8
Hwado	37.65	127.31	KR	8
Buhe	30.29	112.23	CN	8
Hammamet	36.40	10.62	TN	8
Pindiga	9.98	10.95	NG	8
Berdyansk	46.76	36.79	UA	8
Toufen	24.69	120.91	TW	8
Mīāneh	37.42	47.72	IR	8
Dakhla	23.68	-15.96	EH	8
Paniqui	15.67	120.58	PH	8
Novotroitsk	51.20	58.31	RU	8
Bergisch Gladbach	50.99	7.13	DE	8
Rangamati	22.64	92.19	BD	8
Alchevsk	48.47	38.80	UA	8
Sơn La	21.33	103.92	VN	8
Mingachevir	40.76	47.06	AZ	8
Legnica	51.21	16.16	PL	8
Drammen	59.74	10.20	NO	8
Pare	-7.77	112.20	ID	8
Tokoza	-26.36	28.13	ZA	8
Balsas	-7.53	-46.04	BR	8
Sydney	46.14	-60.18	CA	8
Derbent	42.07	48.29	RU	8
Xinghua	32.94	119.83	CN	8
Khurja	28.25	77.86	IN	8
Mati	6.96	126.22	PH	8
Arjawinangun	-6.65	108.41	ID	8
Le Plateau-Mont-Royal	45.53	-73.58	CA	8
Funchal	32.67	-16.93	PT	8
Kishanganj	26.10	87.96	IN	8
Yautepec	18.88	-99.07	MX	8
Jataí	-17.88	-51.72	BR	8
Azare	11.67	10.19	NG	8
Nantou	23.92	120.66	TW	8
Ipojuca	-8.40	-35.06	BR	8
Lahad Datu	5.02	118.33	MY	8
Subulussalam	2.66	97.88	ID	8
Paragominas	-3.00	-47.35	BR	8
Bukama	-9.20	25.85	CD	8
Ponnāni	10.77	75.93	IN	8
Tanza	14.68	120.94	PH	8
Inzai	35.83	140.16	JP	8
Bhairab Bāzār	24.05	90.98	BD	8
Chengtangcun	35.08	117.19	CN	8
Hindaun	26.73	77.04	IN	8
Jamālpur	25.31	86.49	IN	8
Abū Tīj	27.05	31.32	EG	8
Coatepeque	14.70	-91.86	GT	8
Baraki	36.67	3.10	DZ	8
Robāţ Karīm	35.48	51.08	IR	8
'Ākra	36.73	43.88	IQ	8
Sandy Springs	33.92	-84.38	US	8
Burbank	34.18	-118.31	US	8
Taling Chan	13.78	100.46	TH	8
San Justo	-34.68	-58.56	AR	8
Hòa Bình	20.82	105.34	VN	8
Saint-Paul	-21.01	55.27	RE	8
Ourense	42.34	-7.86	ES	8
Nāgaur	27.20	73.73	IN	8
Riacho Fundo II	-15.90	-48.05	BR	8
Green Bay	44.52	-88.02	US	8
Mityana	0.42	32.02	UG	8
Jizan	16.89	42.55	SA	8
Texcoco de Mora	19.51	-98.88	MX	8
Bang Bon	13.66	100.40	TH	8
Nikopol	47.57	34.39	UA	8
Slovyansk	48.85	37.60	UA	8
Santa Maria	34.95	-120.44	US	8
San Francisco De Borja	-12.09	-77.00	PE	8
Yidu	36.77	118.42	CN	8
Nancy	48.68	6.18	FR	8
Kuala Krai	5.53	102.20	MY	8
Zhonghe	28.45	108.99	CN	8
Puyang Chengguanzhen	35.71	115.03	CN	8
Ikeda	34.82	135.43	JP	8
Waterloo	43.47	-80.52	CA	8
Ambala Sadar	30.34	76.86	IN	8
Chinautla	14.70	-90.50	GT	8
Salzgitter	52.16	10.42	DE	8
Ville-Marie	45.50	-73.57	CA	8
Bhiwadi	28.21	76.86	IN	8
Būndi	25.44	75.64	IN	8
Miryalaguda	16.87	79.56	IN	8
Daxing	39.74	116.33	CN	8
Assis	-22.66	-50.41	BR	8
Santa Cruz do Capibaribe	-7.96	-36.20	BR	8
Yezhou	30.60	109.72	CN	8
Hidalgo del Parral	26.93	-105.67	MX	8
Saijō	33.92	133.18	JP	8
Jena	50.93	11.59	DE	8
Wichita Falls	33.91	-98.49	US	8
Brantford	43.13	-80.27	CA	8
Gera	50.88	12.08	DE	8
Tuyên Quang	21.82	105.21	VN	8
Al Fāw	29.97	48.47	IQ	8
Angoche	-16.23	39.91	MZ	8
Toride	35.90	140.08	JP	8
Mostar	43.34	17.81	BA	8
Mazyr	52.04	29.22	BY	8
Kamloops	50.67	-120.32	CA	8
Mazabuka	-15.86	27.75	ZM	8
Lakeland	28.04	-81.95	US	8
Zhezqazghan	47.79	67.71	KZ	8
Pailou	30.80	108.39	CN	8
Lo Prado	-33.44	-70.73	CL	8
Tizi Ouzou	36.71	4.05	DZ	8
Pulandian	39.40	121.97	CN	8
Helsingborg	56.05	12.69	SE	8
Abreu e Lima	-7.91	-34.90	BR	8
Kot Addu	30.47	70.97	PK	8
Bouaflé	6.99	-5.74	CI	8
Kara	9.55	1.19	TG	8
Clovis	36.83	-119.70	US	8
Kafue	-15.77	28.18	ZM	8
Wuchuan	21.46	110.77	CN	8
Salaqi	40.54	110.51	CN	8
Kalulushi	-12.84	28.09	ZM	8
Lewisville	33.05	-96.99	US	8
Oued Zem	32.86	-6.57	MA	8
Weldiya	11.83	39.59	ET	8
Soyībug	34.08	74.71	IN	8
Kiselëvsk	53.99	86.66	RU	8
Jishu	44.32	126.80	CN	8
El Kelaa des Srarhna	32.05	-7.41	MA	8
Séguéla	7.96	-6.67	CI	8
Ourinhos	-22.98	-49.87	BR	8
Totonicapán	14.91	-91.36	GT	8
Ad-Damir	17.60	33.97	SD	8
Jagtiāl	18.79	78.92	IN	8
Woking	51.32	-0.56	GB	8
Roorkee	29.87	77.89	IN	8
Edéa	3.80	10.13	CM	8
Yuxi	24.36	102.54	CN	8
Lincoln	53.23	-0.54	GB	8
Poá	-23.53	-46.34	BR	8
Bashan	27.77	116.05	CN	8
Nkpor	6.15	6.83	NG	8
Berbérati	4.26	15.79	CF	8
Sangla Hill	31.72	73.38	PK	8
Tongren	35.51	102.02	CN	8
Tyler	32.35	-95.30	US	8
Male	4.18	73.51	MV	8
El Cajon	32.79	-116.96	US	8
Piacenza	45.05	9.69	IT	8
Gardez	33.60	69.23	AF	8
Zhanaozen	43.34	52.86	KZ	8
Gangu Chengguanzhen	34.74	105.33	CN	8
Teziutlan	19.82	-97.36	MX	8
Kolda	12.89	-14.94	SN	8
Udgīr	18.39	77.12	IN	8
San Mateo	37.56	-122.33	US	8
Viseu	40.66	-7.91	PT	8
Nagda	23.46	75.42	IN	8
Moers	51.45	6.63	DE	8
Brandon	27.94	-82.29	US	8
Buzău	45.15	26.83	RO	8
Reus	41.16	1.11	ES	8
Prabumulih	-3.43	104.23	ID	8
Itabaiana	-10.69	-37.43	BR	8
Francistown	-21.17	27.51	BW	8
Isehara	35.40	139.31	JP	8
Queluz	38.76	-9.25	PT	8
Betūl	21.90	77.90	IN	8
Chikushino-shi	33.50	130.52	JP	8
Turgutlu	38.50	27.70	TR	8
Lida	53.88	25.30	BY	8
Taitung	22.76	121.14	TW	8
San	13.30	-4.90	ML	8
Jahānābād	25.21	84.99	IN	8
Lethbridge	49.70	-112.82	CA	8
Velikiye Luki	56.34	30.54	RU	8
Kashipur	29.21	78.96	IN	8
Rialto	34.11	-117.37	US	8
West Bromwich	52.52	-1.99	GB	8
Ghazīpur	25.58	83.59	IN	8
Tanjung Pandan	-2.73	107.63	ID	8
Ikere-Ekiti	7.50	5.23	NG	8
Hildesheim	52.15	9.95	DE	8
Kharian	32.82	73.89	PK	8
Bendigo	-36.76	144.28	AU	8
Rantauprapat	2.10	99.83	ID	8
Nkayi	-4.18	13.29	CG	8
Amaravati	16.51	80.52	IN	8
Pārsābād	39.65	47.92	IR	8
Lahān	26.72	86.48	NP	8
Liberec	50.77	15.06	CZ	8
Nagapattinam	10.76	79.84	IN	8
Qurayyat	31.33	37.34	SA	8
Buxar	25.58	83.98	IN	8
Portmore	17.97	-76.89	JM	8
Santa Rosa	-36.62	-64.29	AR	8
Palma Soriano	20.21	-75.99	CU	8
Pushkino	55.99	37.83	RU	8
Khushāb	32.30	72.35	PK	8
Lafiagi	8.85	5.42	NG	8
Caieiras	-23.36	-46.74	BR	8
Xincheng	41.71	82.93	CN	8
Pasrur	32.26	74.66	PK	8
Belawan	3.78	98.68	ID	8
Pano Aqil	27.86	69.11	PK	8
Piatra Neamţ	46.92	26.33	RO	8
Cabudare	10.03	-69.26	VE	8
Erlangen	49.59	11.01	DE	8
Tepexpan	19.61	-98.94	MX	8
Tivaouane	14.95	-16.82	SN	8
Entebbe	0.06	32.48	UG	8
Davenport	41.52	-90.58	US	8
Darnah	32.77	22.64	LY	8
Dayrūţ	27.56	30.81	EG	8
Edison	40.52	-74.41	US	8
Curicó	-34.98	-71.24	CL	8
Kangsŏn	38.94	125.58	KP	8
La Vega	19.22	-70.53	DO	8
Shāhzādpur	24.18	89.60	BD	8
Tulancingo	20.08	-98.36	MX	8
Yono	35.88	139.63	JP	8
Apatzingán	19.09	-102.36	MX	8
Hillsboro	45.52	-122.99	US	8
Mormugao	15.39	73.81	IN	8
Seoni	22.09	79.55	IN	8
Shabqadar	34.22	71.55	PK	8
Sabanalarga	10.63	-74.92	CO	8
Jishou	28.32	109.73	CN	8
Ngong	-1.35	36.67	KE	8
Francisco Beltrão	-26.08	-53.05	BR	8
Sebeta	8.92	38.62	ET	8
Artëm	43.36	132.19	RU	8
Tsuyama	35.05	134.00	JP	8
Limerick	52.66	-8.62	IE	8
Aurangābād	24.75	84.37	IN	8
Lampa	-33.29	-70.88	CL	8
Sungai Penuh	-2.06	101.39	ID	8
Ituiutaba	-18.97	-49.46	BR	8
Ukhta	63.57	53.69	RU	8
Nakhon Si Thammarat	8.43	99.97	TH	8
Japeri	-22.64	-43.65	BR	8
Shuifu	28.63	104.41	CN	8
Kani	35.40	137.06	JP	8
Ōnojō	33.54	130.48	JP	8
Kot Radha Kishan	31.17	74.10	PK	8
Al Jumayl	32.85	12.06	LY	8
Maldonado	-34.90	-54.95	UY	8
Venlo	51.37	6.17	NL	8
Mairiporã	-23.32	-46.59	BR	8
Novara	45.45	8.62	IT	8
Shūshtar	32.05	48.85	IR	8
Al-Musayab	32.78	44.29	IQ	8
Parintins	-2.63	-56.74	BR	8
Hedong	23.92	115.78	CN	8
Hinganghāt	20.55	78.84	IN	8
Zonguldak	41.45	31.79	TR	8
Iğdır	39.92	44.05	TR	8
Kawachi-Nagano	34.44	135.58	JP	8
Eastbourne	50.77	0.28	GB	8
Dhamtari	20.71	81.55	IN	8
Delta	49.09	-123.05	CA	8
Orsha	54.51	30.40	BY	8
Worcester	52.19	-2.22	GB	8
Las Cruces	32.31	-106.78	US	8
Székesfehérvár	47.19	18.41	HU	8
Lagarto	-10.92	-37.65	BR	8
Bath	51.38	-2.36	GB	8
Sidi Slimane	34.26	-5.93	MA	8
Leme	-22.19	-47.39	BR	8
Iida	35.52	137.82	JP	8
Los Puertos de Altagracia	10.71	-71.52	VE	8
South Bend	41.68	-86.25	US	8
Kansk	56.20	95.72	RU	8
Chilliwack	49.17	-121.95	CA	8
Queenstown Estate	1.29	103.80	SG	8
Argenteuil	48.95	2.25	FR	8
Khanty-Mansiysk	61.00	69.03	RU	8
Isulan	6.63	124.61	PH	8
Mbaké	14.79	-15.91	SN	8
Pavlohrad	48.53	35.87	UA	8
Mustafakemalpaşa	40.04	28.41	TR	8
Burayu	9.04	38.66	ET	8
Chilakalūrupet	16.09	80.17	IN	8
Malappuram	11.04	76.08	IN	8
Ébolowa	2.90	11.15	CM	8
Dartmouth	44.67	-63.58	CA	8
Orihuela	38.08	-0.94	ES	8
Sangju	36.42	128.16	KR	8
Perling	1.48	103.68	MY	8
Albany	42.65	-73.76	US	8
São Cristóvão	-11.01	-37.21	BR	8
Medina Estates	5.67	-0.16	GH	8
Chakwal	32.93	72.85	PK	8
Ngã Bảy	9.81	105.82	VN	8
Gillingham	51.39	0.55	GB	8
Suruç	36.98	38.43	TR	8
Huacheng	24.07	115.61	CN	8
Ocaña	8.24	-73.36	CO	8
Hồng Ngự	10.80	105.35	VN	8
Daoukro	7.06	-3.96	CI	8
Tokuyama	34.05	131.82	JP	8
Ţimā	26.91	31.43	EG	8
Donghae City	37.54	129.11	KR	8
Standerton	-26.93	29.24	ZA	8
Kanoya	31.38	130.85	JP	8
Mokopane	-24.19	29.01	ZA	8
Dikirnis	31.09	31.59	EG	8
New Bedford	41.64	-70.93	US	8
Lāhījān	37.20	50.01	IR	8
Leuven	50.88	4.70	BE	8
Mezhdurechensk	53.69	88.06	RU	8
Bānswāra	23.54	74.44	IN	8
Jolo	6.05	121.00	PH	8
Elbasan	41.11	20.08	AL	8
Ijok	3.32	101.40	MY	8
Vista	33.20	-117.24	US	8
Davie	26.06	-80.23	US	8
Errachidia	31.93	-4.43	MA	8
Twifu Praso	5.61	-1.55	GH	8
Red Deer	52.27	-113.80	CA	8
Solikamsk	59.67	56.74	RU	8
El Progreso	15.40	-87.80	HN	8
Chirmiri	23.19	82.35	IN	8
Chikusei	36.32	139.98	JP	8
Sungailiat	-1.85	106.12	ID	8
Arezzo	43.46	11.88	IT	8
Calasiao	16.01	120.36	PH	8
Glazov	58.14	52.66	RU	8
Rosarito	32.36	-117.05	MX	8
Kallithéa	37.95	23.70	GR	8
Ahar	38.48	47.07	IR	8
Juan Díaz	9.04	-79.44	PA	8
Yên Bái	21.72	104.91	VN	8
Grogol	-7.60	110.82	ID	8
Nāḩiyat al Iskandarīyah	32.89	44.35	IQ	8
Puerto Barrios	15.73	-88.60	GT	8
Bakwa	4.13	27.40	CD	8
Itārsi	22.61	77.76	IN	8
Si Maha Phot	13.97	101.51	TH	8
Hà Tiên	10.38	104.49	VN	8
Masjed Soleymān	31.94	49.30	IR	8
Los Rastrojos	10.03	-69.24	VE	8
Vasco da Gama	15.40	73.82	IN	8
Barakaldo	43.30	-2.99	ES	8
Lianjiang	21.65	110.28	CN	8
Ermelo	-26.53	29.98	ZA	8
Klagenfurt am Wörthersee	46.62	14.31	AT	8
Linxi	39.71	118.45	CN	8
Tiébo	14.63	-16.23	SN	8
Gangtok	27.33	88.61	IN	8
Datia	25.67	78.46	IN	8
Sakado	35.96	139.39	JP	8
Sakata	38.92	139.85	JP	8
Ust’-Ilimsk	58.00	102.66	RU	8
Girona	41.98	2.82	ES	8
Renton	47.48	-122.22	US	8
Chust	41.00	71.24	UZ	8
Kalmunai	7.41	81.83	LK	8
Udine	46.07	13.24	IT	8
Xinzhai	36.40	118.62	CN	8
Phagwāra	31.22	75.77	IN	8
Izumisano	34.42	135.32	JP	8
Trier	49.76	6.64	DE	8
Ginowan	26.26	127.76	JP	8
Inda Silasē	14.10	38.28	ET	8
Negara	-8.36	114.62	ID	8
Qaşr Bin Ghashīr	32.68	13.18	LY	8
Renala Khurd	30.88	73.60	PK	8
Punta Cana	18.58	-68.40	DO	8
Roanoke	37.27	-79.94	US	8
Kangding	30.00	101.96	CN	8
Airoli	19.15	73.00	IN	8
Shahrak-e Pardīsān	34.56	50.80	IR	8
P’yŏngsŏng	39.25	125.87	KP	8
Tājūrā’	32.88	13.35	LY	8
Sentul	3.18	101.68	MY	8
Seri Manjung	4.20	100.67	MY	8
Bandar Mahkota Cheras	3.05	101.80	MY	8
Alasia	6.47	3.17	NG	8
Raja Jang	31.22	74.25	PK	8
Model Town	31.48	74.33	PK	8
Subotica	46.10	19.67	RS	8
Nyagatare	-1.30	30.32	RW	8
Sabt Alalayah	19.58	41.96	SA	8
Sakiet ez Zit	34.80	10.76	TN	8
al-Yarmūk	33.47	36.30	SY	6
Jaramānā	33.49	36.35	SY	6
Qincheng	27.21	116.53	CN	6
Luckeesarai	25.18	86.09	IN	6
Menghuan	24.44	98.58	CN	6
Śródmieście	52.23	21.02	PL	6
Hāgere Hiywet	8.98	37.85	ET	6
San Angelo	31.46	-100.44	US	6
Kambove	-10.87	26.60	CD	6
Bislig	8.22	126.32	PH	6
Xixiang	32.99	107.76	CN	6
Dipalpur	30.67	73.65	PK	6
Kenosha	42.58	-87.82	US	6
Nabire	-3.36	135.50	ID	6
Chanthaburi	12.61	102.10	TH	6
Niagara Falls	43.10	-79.07	CA	6
Dongsheng	39.82	109.98	CN	6
Andria	41.23	16.30	IT	6
Tucupita	9.06	-62.05	VE	6
Clinton Township	42.59	-82.92	US	6
Shikohābād	27.11	78.59	IN	6
Villa de Cura	10.04	-67.49	VE	6
Al Jammālīyah	31.18	31.86	EG	6
San Chaung	17.10	96.10	MM	6
Wangkui	46.83	126.48	CN	6
Zelenodolsk	55.84	48.52	RU	6
Al Qūşīyah	27.44	30.82	EG	6
Dschang	5.44	10.05	CM	6
Hwasŏng	41.26	129.49	KP	6
Myŏnggan-dong	41.14	129.49	KP	6
Dhahran	26.29	50.11	SA	6
Santiago de Compostela	42.88	-8.55	ES	6
Roubaix	50.69	3.17	FR	6
Manbij	36.53	37.95	SY	6
Olomouc	49.60	17.25	CZ	6
Novoshakhtinsk	47.76	39.93	RU	6
Erie	42.13	-80.09	US	6
Kāsganj	27.81	78.65	IN	6
Šiauliai	55.93	23.32	LT	6
Hualien City	23.98	121.60	TW	6
Campo Mourão	-24.04	-52.38	BR	6
Meihekou	42.53	125.68	CN	6
Santander de Quilichao	3.01	-76.48	CO	6
Xinle	38.35	114.69	CN	6
Acharnés	38.08	23.73	GR	6
Qubo Saeed Khan	27.87	67.71	PK	6
Mafinga	-8.30	35.29	TZ	6
Taman Melawati	3.21	101.75	MY	6
Minyā al Qamḩ	30.52	31.35	EG	6
Bang Rak	13.73	100.52	TH	6
Burao	9.52	45.53	SO	6
Bam	29.11	58.36	IR	6
Manavgat	36.79	31.44	TR	6
Guercif	34.23	-3.35	MA	6
Khambhāt	22.32	72.62	IN	6
Tourcoing	50.72	3.16	FR	6
Kandhkot	28.25	69.18	PK	6
Saku	36.22	138.48	JP	6
Bhola	22.69	90.64	BD	6
Talara	-4.58	-81.27	PE	6
Riberalta	-11.01	-66.05	BO	6
Linghe	36.36	119.08	CN	6
Siverskodonetsk	48.94	38.49	UA	6
Morón	-34.65	-58.62	AR	6
Zárate	-34.10	-59.02	AR	6
Portsmouth Heights	36.82	-76.37	US	6
Kohima	25.67	94.11	IN	6
Choma	-16.81	26.99	ZM	6
Xingcheng	40.62	120.72	CN	6
Paoy Paet	13.66	102.56	KH	6
Pandharpur	17.68	75.33	IN	6
Kapurthala Town	31.38	75.38	IN	6
Itoshima	33.54	130.18	JP	6
Burzaco	-34.83	-58.40	AR	6
Sarapul	56.48	53.80	RU	6
Zwickau	50.73	12.49	DE	6
Kontagora	10.40	5.47	NG	6
Corumbá	-19.01	-57.65	BR	6
Kaiserslautern	49.44	7.77	DE	6
Soma	39.19	27.61	TR	6
Thimphu	27.47	89.64	BT	6
Bocaue	14.80	120.93	PH	6
Votkinsk	57.05	53.99	RU	6
Caldas Novas	-17.74	-48.63	BR	6
Spring Hill	28.48	-82.53	US	6
São Sebastião	-15.90	-47.78	BR	6
Słupsk	54.46	17.03	PL	6
Renqiu	38.71	116.10	CN	6
Suifenhe	44.40	131.15	CN	6
Mahuva	21.09	71.77	IN	6
Cárdenas	23.04	-81.21	CU	6
Bridgetown	13.11	-59.62	BB	6
Barra do Piraí	-22.47	-43.83	BR	6
Compton	33.90	-118.22	US	6
Serov	59.60	60.59	RU	6
Habboûch	33.41	35.48	LB	6
Xinshi	31.05	113.14	CN	6
Vĩnh Thạnh	10.22	105.40	VN	6
League City	29.51	-95.09	US	6
Flint	43.01	-83.69	US	6
Silvassa	20.27	73.00	IN	6
Al Qaţīf	26.57	50.01	SA	6
Kōnan	35.33	136.87	JP	6
Balāngīr	20.70	83.49	IN	6
Lagos de Moreno	21.36	-101.93	MX	6
Chengzihe	45.34	131.00	CN	6
Thayetmyo	19.32	95.18	MM	6
Xishan	27.67	113.50	CN	6
Allen	33.10	-96.67	US	6
Barika	35.39	5.37	DZ	6
Aïn Oussera	35.45	2.91	DZ	6
Balashov	51.55	43.17	RU	6
Arsi Negele	7.35	38.67	ET	6
Dukuhturi	-6.90	109.08	ID	6
Iguatu	-6.36	-39.30	BR	6
Fasā	28.94	53.65	IR	6
Saint-Jean-sur-Richelieu	45.31	-73.26	CA	6
Nawāda	24.89	85.54	IN	6
Lugo	43.01	-7.56	ES	6
Bhilai Charoda	21.22	81.46	IN	6
Mīnāb	27.13	57.09	IR	6
Dar‘ā	32.62	36.10	SY	6
Shāmli	29.45	77.31	IN	6
Chitose	42.82	141.65	JP	6
Yeyuan	36.42	118.50	CN	6
Trelew	-43.25	-65.31	AR	6
Kamyanets-Podilskyi	48.68	26.59	UA	6
Zheleznogorsk	52.34	35.36	RU	6
Kâhta	37.79	38.62	TR	6
Valença	-13.37	-39.07	BR	6
Santa Cruz de Yojoa	14.98	-87.89	HN	6
Dorchester	42.30	-71.07	US	6
Erdenet	49.03	104.08	MN	6
Hyesan-dong	41.40	128.19	KP	6
Temixco	18.85	-99.23	MX	6
Namalombwe	-15.39	28.19	ZM	6
Asan	36.78	127.00	KR	6
Catarman	12.50	124.64	PH	6
Jharsuguda	21.86	84.01	IN	6
Gò Công	10.37	106.67	VN	6
Guanhu	34.43	118.00	CN	6
Itaúna	-20.08	-44.58	BR	6
Sādatpur Gujran	28.73	77.25	IN	6
Oulad Teïma	30.39	-9.21	MA	6
Jiudian	36.99	120.20	CN	6
Gambēla	8.25	34.58	ET	6
Chalisgaon	20.46	75.02	IN	6
Rochdale	53.62	-2.16	GB	6
Aguachica	8.31	-73.62	CO	6
Jérémie	18.65	-74.12	HT	6
Xinxing	34.78	105.32	CN	6
Herzliya	32.17	34.83	IL	6
Parand	35.47	50.98	IR	6
Rio Largo	-9.48	-35.85	BR	6
Pyinmana	19.74	96.21	MM	6
Villupuram	11.94	79.49	IN	6
Amalner	21.04	75.06	IN	6
Kuje	8.88	7.23	NG	6
Luján	-34.57	-59.11	AR	6
Swabi	34.12	72.47	PK	6
Hadera	32.44	34.90	IL	6
Deventer	52.26	6.16	NL	6
Villa Alemana	-33.05	-71.37	CL	6
Brikama	13.27	-16.65	GM	6
Tellicherry	11.75	75.49	IN	6
Naxçıvan	39.21	45.41	AZ	6
Zhukovsky	55.60	38.12	RU	6
Kameoka	35.00	135.58	JP	6
Mission Viejo	33.60	-117.67	US	6
Pará de Minas	-19.86	-44.61	BR	6
Cesena	44.14	12.24	IT	6
Manjeri	11.12	76.12	IN	6
Munakata	33.80	130.56	JP	6
Messaad	34.15	3.50	DZ	6
Escalante	10.84	123.50	PH	6
Molenbeek-Saint-Jean	50.85	4.31	BE	6
Fangshan	39.69	116.00	CN	6
Chimaltenango	14.66	-90.82	GT	6
Magway	20.15	94.93	MM	6
Tumbes	-3.56	-80.44	PE	6
Dijkot	31.22	73.00	PK	6
Quvasoy	40.30	71.98	UZ	6
Beshariq	40.44	70.61	UZ	6
Bekobod	40.22	69.27	UZ	6
Jinniu	25.80	100.57	CN	6
Caotun	23.98	120.69	TW	6
Ariquemes	-9.91	-63.04	BR	6
Vacaville	38.36	-121.99	US	6
Grand-Bassam	5.21	-3.74	CI	6
Binga	2.37	20.50	CD	6
Yasuj	30.67	51.59	IR	6
Villa Mercedes	-33.68	-65.46	AR	6
Ben Guerir	32.24	-7.95	MA	6
Wabu	37.59	127.22	KR	6
Ventura	34.28	-119.29	US	6
Khurarianwala	31.50	73.27	PK	6
Houzhen	36.99	118.97	CN	6
Dogonbadan	30.36	50.80	IR	6
Sumber	-6.76	108.48	ID	6
Highlands Ranch	39.55	-104.97	US	6
Lawton	34.61	-98.39	US	6
Azimpur	23.73	90.39	BD	6
Schwerin	53.63	11.41	DE	6
Beaverton	45.49	-122.80	US	6
Jaworzno	50.21	19.27	PL	6
Zhudong	24.73	121.09	TW	6
Gongguan	21.80	109.60	CN	6
Pouytenga	12.25	-0.43	BF	6
Estelí	13.09	-86.36	NI	6
Soligorsk	52.79	27.54	BY	6
Nghĩa Đô	21.05	105.80	VN	6
Monkayo	7.82	126.05	PH	6
South Gate	33.95	-118.21	US	6
Jounieh	33.98	35.62	LB	6
Caloundra	-26.80	153.12	AU	6
Ceyhan	37.02	35.82	TR	6
Shibata	37.95	139.33	JP	6
Stellenbosch	-33.93	18.87	ZA	6
Bārmer	25.75	71.39	IN	6
Maribor	46.56	15.65	SI	6
Caçapava	-23.10	-45.71	BR	6
Portsmouth	36.84	-76.30	US	6
Muroran	42.32	140.99	JP	6
Gütersloh	51.91	8.38	DE	6
Limpio	-25.17	-57.49	PY	6
Saint-Denis	48.94	2.35	FR	6
Khōst	33.34	69.92	AF	6
Avaré	-23.10	-48.93	BR	6
Sparks	39.53	-119.75	US	6
Erechim	-27.63	-52.28	BR	6
Cáceres	39.48	-6.37	ES	6
Nanxi	28.84	104.98	CN	6
General Trias	14.39	120.88	PH	6
Pūth Kalān	28.71	77.08	IN	6
Japekrom	7.58	-2.79	GH	6
Ramenskoye	55.56	38.24	RU	6
Ouislane	33.91	-5.49	MA	6
Hemel Hempstead	51.75	-0.45	GB	6
Kuniyamuttūr	10.96	76.95	IN	6
Bang Na	13.67	100.64	TH	6
Sardārshahr	28.44	74.49	IN	6
Sānand	22.99	72.38	IN	6
Sāhibganj	25.24	87.63	IN	6
Ash-Shaykh Zāyid	30.02	31.00	EG	6
Tema New Town	5.65	0.03	GH	6
Vilhena	-12.74	-60.15	BR	6
Lubu	23.17	112.28	CN	6
Jastrzębie Zdrój	49.96	18.57	PL	6
Río Gallegos	-51.63	-69.25	AR	6
Shimada	34.82	138.18	JP	6
Jinsha	32.09	121.07	CN	6
Ciudad Río Bravo	25.99	-98.09	MX	6
Ŭnch’ŏn-ŭp	38.57	125.43	KP	6
Paramagudi	9.55	78.59	IN	6
Shkodër	42.07	19.51	AL	6
Zerakpur	30.66	76.82	IN	6
Las Rozas de Madrid	40.49	-3.87	ES	6
Yuma	32.73	-114.62	US	6
Ducheng	23.24	111.53	CN	6
Cipolletti	-38.93	-67.99	AR	6
Kamisu	35.90	140.67	JP	6
Burdur	37.72	30.29	TR	6
Shenjiamen	29.96	122.30	CN	6
Ōmura	32.92	129.95	JP	6
San Carlos de Bariloche	-41.15	-71.31	AR	6
Inhambane	-23.86	35.38	MZ	6
Novopolotsk	55.53	28.59	BY	6
Tiruchengode	11.38	77.89	IN	6
Amozoc de Mota	19.05	-98.05	MX	6
Brockton	42.08	-71.02	US	6
Owendo	0.29	9.50	GA	6
Mons	50.45	3.95	BE	6
Hương Thủy	16.42	107.64	VN	6
Yotsukaidō	35.65	140.17	JP	6
Boli	45.75	130.58	CN	6
Gafsa	34.42	8.78	TN	6
Xiaoshan	30.17	120.26	CN	6
Saint-Michel de l'Atalaye	19.37	-72.33	HT	6
Xingguo	34.86	105.67	CN	6
Pagoh	2.15	102.77	MY	6
Saquarema	-22.90	-42.47	BR	6
San Fernando	36.48	-6.20	ES	6
Dearborn	42.32	-83.18	US	6
Federal Way	47.32	-122.31	US	6
Closepet	12.72	77.28	IN	6
Emmiganūr	15.77	77.48	IN	6
Labuan	5.28	115.25	MY	6
Lindi	-10.00	39.72	TZ	6
Lee's Summit	38.91	-94.38	US	6
Daanbantayan	11.25	124.01	PH	6
Vaniyambadi	12.68	78.62	IN	6
Delft	52.01	4.36	NL	6
Kovilpatti	9.17	77.87	IN	6
Asheville	35.60	-82.55	US	6
Zaxo	37.15	42.69	IQ	6
Ushirombo	-3.49	31.96	TZ	6
Aqaba	29.53	35.01	JO	6
Catumbela	-12.43	13.55	AO	6
Frederiksberg	55.68	12.53	DK	6
Kutloanong	-27.83	26.75	ZA	6
Biu	10.61	12.19	NG	6
Olupona	7.60	4.19	NG	6
Romford	51.58	0.19	GB	6
Vostochnoe Degunino	55.88	37.56	RU	6
La Gazelle	36.89	10.19	TN	6
Cereté	8.88	-75.79	CO	6
Roquetas de Mar	36.76	-2.61	ES	6
Spokane Valley	47.67	-117.24	US	6
Kanuma	36.55	139.73	JP	6
As Salamīyah	35.01	37.05	SY	6
Parli Vaijnāth	18.85	76.53	IN	6
Bình Minh	10.07	105.82	VN	6
Alkmaar	52.63	4.75	NL	6
Tiko	4.08	9.36	CM	6
Wuchang	44.93	127.16	CN	6
Djougou	9.71	1.67	BJ	6
Aracruz	-19.82	-40.27	BR	6
Leskovac	43.00	21.95	RS	6
Behshahr	36.69	53.55	IR	6
Hanamaki	39.38	141.12	JP	6
Tiflet	33.89	-6.31	MA	6
Bibā	28.92	30.99	EG	6
Sanjō	37.62	138.95	JP	6
Nemby	-25.39	-57.54	PY	6
Livonia	42.37	-83.35	US	6
Al Qurayn	30.62	31.74	EG	6
Mainpuri	27.23	79.03	IN	6
Khāmgaon	20.71	76.57	IN	6
Roswell	34.02	-84.36	US	6
Aksum	14.12	38.72	ET	6
Makrāna	27.04	74.72	IN	6
Yonezawa	37.91	140.12	JP	6
São João del Rei	-21.14	-44.26	BR	6
Orem	40.30	-111.69	US	6
Allinagaram	10.03	77.48	IN	6
Dunhou	27.05	114.90	CN	6
Bayan Hot	38.84	105.67	CN	6
Ximeicun	24.99	118.39	CN	6
Azumino	36.29	137.89	JP	6
Daxi	24.88	121.29	TW	6
Novyy Urengoy	66.08	76.63	RU	6
Boryeong	36.35	126.60	KR	6
Yilan	24.76	121.75	TW	6
Awsīm	30.12	31.14	EG	6
Gjakovë	42.38	20.43	XK	6
Yishui	35.78	118.63	CN	6
Ruwa	-17.89	31.24	ZW	6
Sông Cầu	13.46	109.22	VN	6
Pendang	6.00	100.48	MY	6
Paracatu	-17.22	-46.87	BR	6
Fall River	41.70	-71.16	US	6
Cacém	38.77	-9.30	PT	6
Gudiyatham	12.95	78.87	IN	6
Zhongduo	28.85	108.76	CN	6
Hayes	51.52	-0.42	GB	6
Ashiya	34.73	135.30	JP	6
Dhār	22.59	75.30	IN	6
Lawrence	38.97	-95.24	US	6
Gambat	27.35	68.52	PK	6
Novoural’sk	57.25	60.09	RU	6
The Woodlands	30.16	-95.49	US	6
Bandar Kinrara	3.05	101.64	MY	6
Fangcheng	33.26	113.00	CN	6
West Albany	42.68	-73.78	US	6
Norrköping	58.59	16.18	SE	6
Bohicon	7.18	2.07	BJ	6
Daotian	36.83	118.90	CN	6
Yakima	46.60	-120.51	US	6
Baijiantan	45.69	85.14	CN	6
Yunnanyi	25.42	100.69	CN	6
Shuangliao	43.51	123.50	CN	6
Mogi Mirim	-22.43	-46.96	BR	6
Lajeado	-29.47	-51.96	BR	6
García	25.80	-100.59	MX	6
Quincy	42.25	-71.00	US	6
Aflou	34.11	2.10	DZ	6
Yala	6.54	101.28	TH	6
Dipolog	8.57	123.33	PH	6
Al-Qāsim	32.30	44.68	IQ	6
Baraut	29.10	77.26	IN	6
Michurinsk	52.91	40.48	RU	6
Kuala Nerus	5.37	103.02	MY	6
Kribi	2.94	9.91	CM	6
Guadalajara	40.63	-3.16	ES	6
Düren	50.80	6.49	DE	6
České Budějovice	48.97	14.47	CZ	6
Fuwwah	31.20	30.55	EG	6
Yashio	35.82	139.84	JP	6
Lysychansk	48.91	38.42	UA	6
Monastir	35.78	10.83	TN	6
Harlow	51.78	0.11	GB	6
Dalai	45.50	124.30	CN	6
Hesperia	34.43	-117.30	US	6
Lere	10.39	8.57	NG	6
La Spezia	44.10	9.82	IT	6
Carson	33.83	-118.28	US	6
Barletta	41.31	16.28	IT	6
Modi‘in Makkabbim Re‘ut	31.89	35.02	IL	6
Polatlı	39.58	32.14	TR	6
Tangwu	36.45	118.86	CN	6
Boca Raton	26.36	-80.08	US	6
Jiayue	36.02	119.18	CN	6
Santa Monica	34.02	-118.49	US	6
Rubio	7.70	-72.36	VE	6
Praga Północ	52.25	21.03	PL	6
Kalyani	22.98	88.43	IN	6
Changping	40.22	116.23	CN	6
Inagi	35.63	139.50	JP	6
Râmnicu Vâlcea	45.10	24.37	RO	6
Ōbu	35.02	136.95	JP	6
Galle	6.05	80.21	LK	6
Stilfontein	-26.84	26.77	ZA	6
Doddaballapura	13.29	77.54	IN	6
Heerlen	50.88	5.98	NL	6
Ozamiz City	8.15	123.84	PH	6
Lorca	37.67	-1.70	ES	6
Itajubá	-22.43	-45.45	BR	6
Qonce	-32.88	27.39	ZA	6
Jinja	0.44	33.20	UG	6
Nouméa	-22.27	166.45	NC	6
Kitakami	39.28	141.12	JP	6
Heho	20.72	96.82	MM	6
Kalaw	20.63	96.56	MM	6
Wonosobo	-7.36	109.90	ID	6
La Marsa	36.88	10.32	TN	6
Kineshma	57.44	42.13	RU	6
Negage	-7.76	15.27	AO	6
Bafra	41.57	35.90	TR	6
Chīrāla	15.82	80.35	IN	6
Wukari	7.87	9.78	NG	6
Krasnogorsk	55.82	37.33	RU	6
San Marcos	33.14	-117.17	US	6
Guaíba	-30.11	-51.33	BR	6
Pushkin	59.71	30.40	RU	6
Hastings	50.86	0.58	GB	6
Moa	20.66	-74.95	CU	6
Lianzhou	24.78	112.37	CN	6
Sunyani	7.34	-2.33	GH	6
Malacatán	14.91	-92.06	GT	6
Magadan	59.56	150.80	RU	6
Beni Mered	36.52	2.86	DZ	6
Igbo-Ora	7.43	3.29	NG	6
Cajamar	-23.36	-46.88	BR	6
High Peak	53.37	-1.85	GB	6
Akot	21.10	77.06	IN	6
Kaizuka	34.45	135.35	JP	6
Palimanan	-6.71	108.42	ID	6
Patos	-7.02	-37.28	BR	6
Yingqiu	36.53	118.99	CN	6
Plantation	26.13	-80.23	US	6
Grudziądz	53.48	18.75	PL	6
São João da Boa Vista	-21.97	-46.80	BR	6
Gharroli	28.62	77.33	IN	6
Njombe	-9.35	34.77	TZ	6
Semenyih	2.95	101.84	MY	6
Maizuru	35.45	135.33	JP	6
Selong	-8.65	116.53	ID	6
Concepción	10.41	-71.69	VE	6
Lynn	42.47	-70.95	US	6
Villa María	-32.41	-63.24	AR	6
Ratchaburi	13.54	99.82	TH	6
Pamekasan	-7.16	113.47	ID	6
Gravatá	-8.20	-35.56	BR	6
Esslingen	48.74	9.30	DE	6
Darlington	54.52	-1.55	GB	6
Muğla	37.22	28.37	TR	6
Bang Phlat	13.79	100.50	TH	6
Tübingen	48.52	9.05	DE	6
Pandeglang	-6.31	106.11	ID	6
Miami Beach	25.79	-80.13	US	6
Rajpura	30.48	76.59	IN	6
Dongcun	36.78	121.16	CN	6
Lucas do Rio Verde	-13.07	-55.91	BR	6
Sibolga	1.74	98.78	ID	6
Serra Talhada	-7.99	-38.30	BR	6
Arden-Arcade	38.60	-121.38	US	6
Pariaman	-0.62	100.12	ID	6
Kudus	-6.80	110.84	ID	6
Rohri	27.69	68.90	PK	6
Alessandria	44.91	8.61	IT	6
Longonjo	-12.91	15.25	AO	6
Longmont	40.17	-105.10	US	6
Hohoe	7.15	0.47	GH	6
Delmas	-26.15	28.68	ZA	6
Nasinu	-18.07	178.51	FJ	6
Duitama	5.82	-73.03	CO	6
Ponta Porã	-22.54	-55.73	BR	6
Muan	34.99	126.48	KR	6
Danjiangkou	32.54	111.51	CN	6
Paranavaí	-23.07	-52.47	BR	6
Kot Kapūra	30.58	74.83	IN	6
Tepatitlán de Morelos	20.82	-102.76	MX	6
Bai’anba	30.76	108.44	CN	6
Kabirwala	30.40	71.86	PK	6
Erciş	39.03	43.36	TR	6
Bugulma	54.54	52.80	RU	6
El Shorouk	30.14	31.62	EG	6
Sassari	40.73	8.56	IT	6
Kilosa	-6.83	36.98	TZ	6
Manhuaçu	-20.26	-42.03	BR	6
Caringin	-6.71	106.82	ID	6
Bhandāra	21.17	79.65	IN	6
Santa Barbara	34.42	-119.70	US	6
Ubatuba	-23.43	-45.07	BR	6
Iserlohn	51.38	7.70	DE	6
Witten	51.44	7.35	DE	6
Nisshin	35.14	137.05	JP	6
Higashi-Matsuyama	36.03	139.42	JP	6
Cuamba	-14.80	36.54	MZ	6
Stevenage	51.90	-0.20	GB	6
Pickering	43.90	-79.13	CA	6
Cidade Ocidental	-16.11	-47.93	BR	6
Zhongshu	24.52	103.77	CN	6
Türkmenbaşy	40.02	52.96	TM	6
Southport	53.65	-3.01	GB	6
Huazhou	21.63	110.58	CN	6
Phú Thọ	21.40	105.22	VN	6
Ratingen	51.30	6.85	DE	6
Porto Amboim	-10.73	13.77	AO	6
Soran	36.66	44.54	IQ	6
Redding	40.59	-122.39	US	6
Xingren	25.43	105.23	CN	6
Cárdenas	18.00	-93.38	MX	6
Grahamstown	-33.30	26.53	ZA	6
Banga	6.42	124.78	PH	6
Longquan	24.67	102.16	CN	6
Kalamariá	40.58	22.95	GR	6
Yatou	37.16	122.44	CN	6
Tanfang	36.70	118.67	CN	6
Kars	40.60	43.09	TR	6
Patrocínio	-18.94	-46.99	BR	6
Lingyuan	41.24	119.40	CN	6
Surallah	6.38	124.75	PH	6
Lodja	-3.52	23.60	CD	6
Tartu	58.38	26.73	EE	6
Sablayan	12.83	120.77	PH	6
Molārband	28.50	77.31	IN	6
Pergamino	-33.89	-60.57	AR	6
Marl	51.66	7.09	DE	6
Macon	32.84	-83.63	US	6
Bạch Mai	20.98	105.83	VN	6
Tucuruí	-3.77	-49.68	BR	6
Jirapa	10.54	-2.70	GH	6
Rayachoti	14.06	78.75	IN	6
Arujá	-23.40	-46.32	BR	6
Al Minshāh	26.48	31.80	EG	6
Daisen	39.44	140.49	JP	6
Nakonde	-9.34	32.74	ZM	6
Bethlehem	-28.23	28.31	ZA	6
Niğde	37.97	34.68	TR	6
Newmarket	44.05	-79.47	CA	6
Lünen	51.62	7.53	DE	6
Launceston	-41.44	147.13	AU	6
Ga-Rankuwa	-25.62	27.99	ZA	6
Gaoyou	32.79	119.44	CN	6
Kunjah	32.53	73.97	PK	6
Lüleburgaz	41.40	27.36	TR	6
Myitkyina	25.38	97.40	MM	6
Lqoliaa	30.30	-9.47	MA	6
Yulinshi	38.29	109.74	CN	6
Chauk	20.90	94.82	MM	6
Al Badrashayn	29.85	31.27	EG	6
Thakhèk	17.41	104.83	LA	6
Chinhoyi	-17.37	30.20	ZW	6
Namyangju	37.64	127.21	KR	6
‘Amrān	15.66	43.94	YE	6
Imizu	36.77	137.13	JP	6
Meridian	43.61	-116.39	US	6
San Leandro	37.72	-122.16	US	6
Kishorganj	24.44	90.78	BD	6
Caratinga	-19.79	-42.14	BR	6
Mtwapa	-3.94	39.75	KE	6
Emure-Ekiti	7.44	5.46	NG	6
Hanting	36.77	119.21	CN	6
Kattaqo’rg’on Shahri	39.91	66.27	UZ	6
Greenville	35.61	-77.37	US	6
Hradec Králové	50.21	15.83	CZ	6
Körfez	40.77	29.78	TR	6
Mihara	34.40	133.08	JP	6
Çankırı	40.60	33.62	TR	6
Eslāmābād-e Gharb	34.11	46.53	IR	6
Chester	53.19	-2.89	GB	6
Moḩammadīyeh	36.22	50.18	IR	6
Retalhuleu	14.54	-91.68	GT	6
Nanaimo	49.17	-123.94	CA	6
Ziway	7.93	38.72	ET	6
Palmerston North	-40.36	175.61	NZ	6
Kuznetsk	53.12	46.60	RU	6
Tual	-5.63	132.75	ID	6
Montelíbano	7.98	-75.42	CO	6
Xihe	31.69	113.47	CN	6
Guliston	40.50	68.78	UZ	6
San Juan Bautista	11.01	-63.94	VE	6
Ústí nad Labem	50.66	14.03	CZ	6
Cubal	-13.04	14.25	AO	6
Kadayanallur	9.07	77.34	IN	6
Phra Khanong	13.70	100.60	TH	6
Valparai	10.33	76.95	IN	6
Masvingo	-20.06	30.83	ZW	6
Abū Qurqāş	27.93	30.84	EG	6
Duobao	30.67	112.69	CN	6
Kirovo-Chepetsk	58.55	50.03	RU	6
Berdsk	54.75	83.10	RU	6
Bougouni	11.42	-7.48	ML	6
Bela Bela	-24.88	28.28	ZA	6
Pleven	43.42	24.62	BG	6
Reconquista	-29.15	-59.65	AR	6
Huddinge	59.24	17.98	SE	6
Pollachi	10.66	77.01	IN	6
Daharki	28.05	69.70	PK	6
Sishui	35.65	117.28	CN	6
Prosperidad	8.58	125.90	PH	6
El Khroub	36.26	6.69	DZ	6
Alabel	6.10	125.29	PH	6
Wajir	1.75	40.06	KE	6
Araripina	-7.58	-40.50	BR	6
Marudi	4.18	114.32	MY	6
New Plymouth	-39.07	174.08	NZ	6
Kāvali	14.92	79.99	IN	6
Edmond	35.65	-97.48	US	6
Wembley	51.55	-0.30	GB	6
Airdrie	51.30	-114.04	CA	6
San Vicente	-35.02	-58.42	AR	6
Botoşani	47.75	26.67	RO	6
Cela	-11.42	15.12	AO	6
Cafunfo	-8.77	18.00	AO	6
Quissecula	-11.39	15.09	AO	6
Kanata	45.30	-75.92	CA	6
Gantang	27.44	111.97	CN	6
Roha	18.44	73.12	IN	6
Alvand	36.19	50.06	IR	6
Luomen	34.75	105.02	CN	6
Fort-de-France	14.60	-61.07	MQ	6
Ancona	43.61	13.51	IT	6
Isieke	6.38	8.04	NG	6
Huaidian	33.43	115.03	CN	6
Mancherial	18.87	79.43	IN	6
Dinga	32.64	73.72	PK	6
Kwail-ŭp	38.45	125.02	KP	6
Mogok	22.92	96.51	MM	6
Nampa	43.54	-116.56	US	6
Saphan Sung	13.77	100.68	TH	6
Point Pedro	9.82	80.23	LK	6
Butajīra	8.12	38.37	ET	6
Avignon	43.95	4.81	FR	6
Gatchina	59.58	30.13	RU	6
Grays	51.48	0.33	GB	6
Msaken	35.73	10.58	TN	6
Itapeva	-23.98	-48.88	BR	6
Olavarría	-36.89	-60.32	AR	6
Masasi	-10.72	38.80	TZ	6
Lillestrøm	59.96	11.05	NO	6
Cáceres	-16.07	-57.68	BR	6
Calauan	14.15	121.32	PH	6
Avaniyāpuram	9.88	78.11	IN	6
Nyaunglebin	17.95	96.72	MM	6
Trenton	40.22	-74.74	US	6
Kōka	34.98	136.16	JP	6
Sangyoung	16.81	96.13	MM	6
Miaohang	31.32	121.44	CN	6
Maitland	-32.73	151.56	AU	6
Gurupi	-11.73	-49.07	BR	6
Murādnagar	28.78	77.50	IN	6
Tuggeranong	-35.42	149.07	AU	6
Ankleshwar	21.63	72.99	IN	6
Fujin	47.25	132.03	CN	6
Kadiri	14.11	78.16	IN	6
Granada	11.93	-85.95	NI	6
Níkaia	37.97	23.65	GR	6
Katwa	0.09	29.31	CD	6
Mulongo	-7.83	27.00	CD	6
Marseille 13	43.32	5.41	FR	6
Lankaran	38.75	48.85	AZ	6
Huaicheng	23.92	112.18	CN	6
Shahdol	23.29	81.36	IN	6
Shrirampur	19.62	74.66	IN	6
Kwangyang	34.98	127.59	KR	6
Alīgūdarz	33.40	49.69	IR	6
Ŭndŏk	42.52	130.33	KP	6
Houmt Souk	33.88	10.86	TN	6
Miragoâne	18.45	-73.09	HT	6
Gießen	50.59	8.68	DE	6
Polangui	13.29	123.49	PH	6
Hongseong	36.60	126.67	KR	6
Mahobā	25.29	79.88	IN	6
Guidonia Montecelio	41.99	12.72	IT	6
Micheng	25.34	100.49	CN	6
Kalibo (poblacion)	11.71	122.36	PH	6
Mudon	16.26	97.72	MM	6
Lucheng	31.23	117.28	CN	6
Hede	33.77	120.26	CN	6
Kūhdasht	33.53	47.61	IR	6
Chengxiang	31.40	109.57	CN	6
Cruzeiro do Sul	-7.63	-72.68	BR	6
Biyalā	31.17	31.22	EG	6
Harrogate	53.99	-1.54	GB	6
Bibir Hat	22.68	91.79	BD	6
Sambava	-14.27	50.17	MG	6
Nusaybin	37.07	41.21	TR	6
Cicurug	-6.78	106.78	ID	6
Nandajie	29.34	105.89	CN	6
Lengshuitan	26.41	111.60	CN	6
Kartasura	-7.55	110.74	ID	6
Calabanga	13.71	123.21	PH	6
Shwebo	22.57	95.70	MM	6
Iga	34.76	136.13	JP	6
Talavera de la Reina	39.96	-4.83	ES	6
Hartlepool	54.69	-1.21	GB	6
Fusagasugá	4.34	-74.36	CO	6
Mangaldan	16.07	120.40	PH	6
Newton	42.34	-71.21	US	6
Nuneaton	52.52	-1.47	GB	6
Toms River	39.95	-74.20	US	6
Rāmgarh	23.63	85.52	IN	6
Habiganj	24.38	91.41	BD	6
Wangqing	43.31	129.76	CN	6
Rafaela	-31.25	-61.49	AR	6
Carmel	39.98	-86.12	US	6
Xiazhuang	36.45	119.84	CN	6
Contai	21.78	87.75	IN	6
Khan Na Yao	13.83	100.68	TH	6
Hanau am Main	50.13	8.91	DE	6
Montero	-17.34	-63.25	BO	6
Sangrūr	30.25	75.84	IN	6
Dongxing	21.55	107.97	CN	6
Chosica	-11.94	-76.71	PE	6
Val Dor	5.25	100.49	MY	6
Alaghsas	17.02	8.02	NE	6
Thul	28.24	68.78	PK	6
Gengqing	31.82	98.58	CN	6
Pardubice	50.04	15.78	CZ	6
Linjiacun	35.99	119.65	CN	6
Zhoujiaba	30.84	108.37	CN	6
Waukegan	42.36	-87.84	US	6
Deltona	28.90	-81.26	US	6
Takayama	36.13	137.25	JP	6
Berisso	-34.87	-57.88	AR	6
Honghe	36.40	118.92	CN	6
Hawthorne	33.92	-118.35	US	6
Montepuez	-13.13	39.00	MZ	6
Nirmal	19.10	78.34	IN	6
Fūlād Shahr	32.49	51.40	IR	6
Al Bahah	20.01	41.47	SA	6
Fukuroi	34.75	137.92	JP	6
Bhimdatta	28.96	80.18	NP	6
Klangenan	-6.71	108.44	ID	6
El Puerto de Santa María	36.59	-6.23	ES	6
Mobara	35.43	140.30	JP	6
Ben Arous	36.75	10.22	TN	6
Ciénaga	11.01	-74.25	CO	6
Le Kram	36.84	10.32	TN	6
Hastings	-39.64	176.85	NZ	6
Heroica Ciudad de Juchitán de Zaragoza	16.43	-95.02	MX	6
Ifo	6.81	3.20	NG	6
Baixi	28.70	104.55	CN	6
Fort Smith	35.39	-94.40	US	6
Deoband	29.70	77.68	IN	6
North Vancouver	49.32	-123.07	CA	6
Suffolk	36.73	-76.58	US	6
Sugar Land	29.62	-95.63	US	6
Livermore	37.68	-121.77	US	6
Lidu	29.74	107.29	CN	6
Kozan	37.46	35.82	TR	6
Neyyāttinkara	8.40	77.09	IN	6
Tāndā	26.55	82.66	IN	6
Bais	9.59	123.12	PH	6
Mogoditshane	-24.63	25.87	BW	6
Nowshera Kalan	34.02	71.97	PK	6
Taikkyi	17.31	95.96	MM	6
Sarov	54.95	43.32	RU	6
Arayat	15.15	120.77	PH	6
Nashua	42.77	-71.47	US	6
Yuzhou	34.15	113.47	CN	6
Qorveh	35.17	47.81	IR	6
Samannūd	30.96	31.24	EG	6
Yingge	24.96	121.35	TW	6
Wakiso	0.40	32.46	UG	6
Idiofa	-4.97	19.59	CD	6
Gusong	28.31	105.24	CN	6
Kolar	23.16	77.42	IN	6
Yozgat	39.82	34.80	TR	6
Al-Tabqa	35.84	38.55	SY	6
Reading	40.34	-75.93	US	6
Jhumri Telaiya	24.43	85.53	IN	6
Redditch	52.31	-1.95	GB	6
Surigao	9.79	125.50	PH	6
Balkanabat	39.51	54.37	TM	6
Yeysk	46.69	38.28	RU	6
Tagaytay	14.10	120.93	PH	6
Ŏrang	41.45	129.66	KP	6
Arecibo	18.47	-66.72	PR	6
Hanchuan	30.65	113.77	CN	6
Aruppukkottai	9.51	78.10	IN	6
Takasago	34.76	134.79	JP	6
Maumere	-8.62	122.21	ID	6
Buzuluk	52.78	52.26	RU	6
Dapitan	8.66	123.42	PH	6
Farīdkot	30.67	74.76	IN	6
Tiefu	34.53	118.03	CN	6
Maco	7.36	125.86	PH	6
San Antonio	-33.59	-71.61	CL	6
Velbert	51.34	7.04	DE	6
Kadugli	11.01	29.72	SD	6
Qiongshan	20.01	110.35	CN	6
Madgaon	15.28	73.96	IN	6
Gitarama	-2.07	29.76	RW	6
Ludwigsburg	48.90	9.19	DE	6
Xiangxiang	27.73	112.53	CN	6
Deqing	30.54	119.96	CN	6
Indio	33.72	-116.22	US	6
Rio Rancho	35.23	-106.66	US	6
Enchanted Hills	35.34	-106.59	US	6
Taroudant	30.47	-8.88	MA	6
Junín	-34.59	-60.95	AR	6
Santa Fe	35.69	-105.94	US	6
Sandy	40.59	-111.88	US	6
Xujiang	26.84	116.32	CN	6
Settsu	34.78	135.60	JP	6
Wonosari	-7.97	110.60	ID	6
Patnos	39.22	42.86	TR	6
Whittier	33.98	-118.03	US	6
Velampālaiyam	11.14	77.31	IN	6
Thượng Cát	21.09	105.73	VN	6
Ben Gardane	33.14	11.22	TN	6
Bantayan	11.17	123.72	PH	6
Midrand	-25.98	28.12	ZA	6
Maghnia	34.85	-1.73	DZ	6
Jamūī	24.93	86.23	IN	6
Qaraçuxur	40.40	49.97	AZ	6
Maladziečna	54.32	26.85	BY	6
Glyfáda	37.86	23.76	GR	6
Igede-Ekiti	7.67	5.13	NG	6
Kirkland	47.68	-122.21	US	6
Ende	-8.84	121.66	ID	6
Mishan	45.55	131.88	CN	6
Lund	55.71	13.19	SE	6
Nenjiang	49.17	125.22	CN	6
Sefrou	33.83	-4.83	MA	6
Anjār	23.11	70.03	IN	6
Menifee	33.73	-117.15	US	6
Cornellà de Llobregat	41.35	2.08	ES	6
Fulham	51.48	-0.20	GB	6
Paralakhemundi	18.78	84.10	IN	6
Houndé	11.50	-3.52	BF	6
Brindisi	40.63	17.94	IT	6
Newport Beach	33.62	-117.93	US	6
Tracy	37.74	-121.43	US	6
Ad Douiem	14.00	32.31	SD	6
Citrus Heights	38.71	-121.28	US	6
Norton	-17.88	30.70	ZW	6
Bend	44.06	-121.32	US	6
Lerik	38.77	48.41	AZ	6
Gubkin	51.28	37.54	RU	6
Vavoua	7.38	-6.48	CI	6
Effium	6.63	8.06	NG	6
Jharia	23.74	86.41	IN	6
Hacienda Santa Fe	20.52	-103.38	MX	6
Kongolo	-5.39	27.00	CD	6
Ban Mai	7.20	100.55	TH	6
Sơn Trà	16.06	108.23	VN	6
Cacoal	-11.44	-61.45	BR	6
Menglang	22.56	99.91	CN	6
San Ramón de la Nueva Orán	-23.14	-64.32	AR	6
Ad Dawādimī	24.51	44.39	SA	6
Campana	-34.16	-58.96	AR	6
Montréal-Nord	45.60	-73.63	CA	6
Louis Trichardt	-23.04	29.90	ZA	6
Kāraikāl	10.92	79.83	IN	6
Canton	42.31	-83.48	US	6
Caguas	18.23	-66.05	PR	6
Kāmthi	21.22	79.20	IN	6
Lehigh Acres	26.63	-81.62	US	6
Hānsi	29.10	75.96	IN	6
Greenburgh	41.03	-73.84	US	6
Kasoa	5.53	-0.42	GH	6
Shizilu	35.17	118.83	CN	6
Asnières-sur-Seine	48.92	2.28	FR	6
Batticaloa	7.71	81.69	LK	6
Nanterre	48.89	2.21	FR	6
Gbawe	5.58	-0.31	GH	6
Tumaco	1.79	-78.79	CO	6
Chaykovskiy	56.76	54.11	RU	6
Rat Burana	13.68	100.51	TH	6
Atlixco	18.91	-98.44	MX	6
Brno střed	49.19	16.61	CZ	6
Ixelles	50.83	4.37	BE	6
Barra do Corda	-5.51	-45.24	BR	6
Mayiladuthurai	11.10	79.66	IN	6
Jiangshan	36.68	120.53	CN	6
Hualpén	-36.79	-73.10	CL	6
Paraiso	18.40	-93.21	MX	6
Unaí	-16.36	-46.91	BR	6
Vĩnh Tuy	21.00	105.88	VN	6
Gotemba	35.32	138.94	JP	6
Abū an Numrus	29.95	31.20	EG	6
Bojonegoro	-7.15	111.88	ID	6
Zhaogezhuang	39.77	118.41	CN	6
Toledo	39.86	-4.02	ES	6
Al Farwānīyah	29.28	47.96	KW	6
Anakapalle	17.69	83.00	IN	6
Victorias	10.90	123.07	PH	6
Hamakita	34.80	137.78	JP	6
Tulcán	0.81	-77.72	EC	6
Idanre	7.11	5.12	NG	6
Apartadó	7.88	-76.63	CO	6
Bloomington	44.84	-93.30	US	6
Anlong	25.10	105.52	CN	6
Tagbilaran City	9.66	123.85	PH	6
Puli	23.97	120.97	TW	6
Navegantes	-26.90	-48.65	BR	6
Germantown	39.17	-77.27	US	6
Kitanagoya	35.25	136.88	JP	6
Le Sud-Ouest	45.47	-73.59	CA	6
Gyōda	36.14	139.46	JP	6
Clifton	40.86	-74.16	US	6
Nitra	48.31	18.08	SK	6
Miaoli	24.56	120.82	TW	6
Qamdo	31.13	97.18	CN	6
Cái Răng	10.00	105.75	VN	6
Kampung Manjoi	4.62	101.07	MY	6
Dunkirk	51.03	2.38	FR	6
Bangkalan	-7.05	112.74	ID	6
Chigorodó	7.67	-76.68	CO	6
Kasihan	-7.83	110.33	ID	6
Viacha	-16.65	-68.30	BO	6
Maduravoyal	13.07	80.16	IN	6
Ibshawāy	29.36	30.68	EG	6
Kashiwazaki	37.37	138.55	JP	6
Sārni	22.10	78.17	IN	6
Grimsby	53.57	-0.08	GB	6
Nanfeng	23.73	111.80	CN	6
Ama	35.18	136.80	JP	6
Cannock	52.69	-2.03	GB	6
Duluth	46.78	-92.11	US	6
Moncton	46.09	-64.80	CA	6
Rutoma	-0.57	30.38	UG	6
Champaign	40.12	-88.24	US	6
Volos	39.37	22.95	GR	6
Samch’ŏn	38.36	125.33	KP	6
Gbarnga	7.00	-9.47	LR	6
Potiskum	11.71	11.08	NG	6
Tajrīsh	35.80	51.43	IR	6
Novi Pazar	43.14	20.51	RS	6
Melilla	35.29	-2.94	ES	6
Poitiers	46.58	0.34	FR	6
Dausa	26.89	76.34	IN	6
Kepong	3.21	101.64	MY	6
Keffi	8.85	7.87	NG	6
Coari	-4.08	-63.14	BR	6
Galway	53.27	-9.05	IE	6
Usol’ye-Sibirskoye	52.75	103.65	RU	6
Bukit Timah	1.33	103.79	SG	6
Panevėžys	55.73	24.36	LT	6
Zhonggulou	30.82	108.38	CN	6
Parādīp Garh	20.32	86.61	IN	6
Heidelberg	-26.50	28.36	ZA	6
Flensburg	54.79	9.44	DE	6
Longnan	33.40	104.92	CN	6
Peterborough	44.30	-78.32	CA	6
Ryūgasaki	35.90	140.18	JP	6
Treviso	45.67	12.24	IT	6
Helong	42.54	129.00	CN	6
Tecomán	18.92	-103.88	MX	6
Peñaflor	-33.61	-70.88	CL	6
Obruchevo	55.66	37.52	RU	6
Adwa	14.16	38.90	ET	6
Esmeraldas	-19.76	-44.31	BR	6
Redenção	-8.03	-50.03	BR	6
Chino	34.01	-117.69	US	6
Arauca	7.08	-70.76	CO	6
El Bayadh	33.68	1.02	DZ	6
Mukachevo	48.44	22.72	UA	6
Krasnaya Glinka	53.74	52.94	RU	6
Yokote	39.32	140.55	JP	6
Alhambra	34.10	-118.13	US	6
Bangil	-7.60	112.82	ID	6
Nanding	36.75	118.06	CN	6
Birni N Konni	13.80	5.25	NE	6
Moriyama	35.07	135.98	JP	6
Ogden	41.22	-111.97	US	6
Sóc Sơn	21.26	105.85	VN	6
Lakang	24.66	97.19	MM	6
Versailles	48.80	2.13	FR	6
Guozhen	34.37	107.36	CN	6
Sandnes	58.85	5.74	NO	6
Khalifah A City	24.43	54.60	AE	6
Tārūt	26.57	50.04	SA	6
Los Reyes Acaquilpan	19.36	-98.98	MX	6
Maun	-19.98	23.42	BW	6
Torre del Greco	40.79	14.37	IT	6
Al Marj	32.49	20.83	LY	6
Lido di Ostia	41.73	12.28	IT	6
Redwood City	37.49	-122.24	US	6
Sekimachi	35.48	136.92	JP	6
Mehestan	35.99	50.75	IR	6
Yegor’yevsk	55.38	39.04	RU	6
Goiana	-7.56	-35.00	BR	6
Courbevoie	48.90	2.26	FR	6
Bellingham	48.76	-122.49	US	6
Qufu	35.60	116.99	CN	6
Essaouira	31.51	-9.77	MA	6
Makeni	8.89	-12.04	SL	6
Iwamizawa	43.20	141.76	JP	6
Hingoli	19.71	77.14	IN	6
Gia Nghĩa	12.00	107.69	VN	6
Muñoz	15.72	120.90	PH	6
Monte Chingolo	-34.73	-58.35	AR	6
O'Fallon	38.81	-90.70	US	6
Puerto Maldonado	-12.59	-69.20	PE	6
Santa Inês	-3.67	-45.38	BR	6
Mohammed Bin Zayed City	24.35	54.55	AE	6
Sintang	0.07	111.50	ID	6
Rukban	33.31	38.70	JO	6
Damansara Damai	3.20	101.59	MY	6
Vwawa	-9.11	32.93	TZ	6
Repentigny	45.74	-73.45	CA	6
Gonaïves	19.45	-72.69	HT	6
Guanambi	-14.22	-42.78	BR	6
Sathon	13.71	100.53	TH	6
Bāruni	25.48	85.97	IN	6
Lorena	-22.73	-45.12	BR	6
Hoover	33.41	-86.81	US	6
Créteil	48.79	2.47	FR	6
Jeypore	18.86	82.57	IN	6
Como	45.81	9.08	IT	6
Ílion	38.03	23.70	GR	6
Madaripur	23.17	90.21	BD	6
Ciudad Mante	22.74	-98.97	MX	6
Konotop	51.23	33.20	UA	6
Ijuí	-28.39	-53.91	BR	6
Pato Branco	-26.23	-52.67	BR	6
Rivera	-30.91	-55.55	UY	6
Komae	35.63	139.58	JP	6
Laojunmiao	39.83	97.73	CN	6
Cottbus	51.76	14.33	DE	6
Túxpam de Rodríguez Cano	20.96	-97.41	MX	6
Seropédica	-22.74	-43.71	BR	6
Chiguayante	-36.93	-73.03	CL	6
Epe	6.58	3.98	NG	6
El Ejido	36.78	-2.81	ES	6
Nakatsu	33.60	131.19	JP	6
Melbourne	28.08	-80.61	US	6
Gamboru	12.37	14.21	NG	6
Dien Bien Phu	21.39	103.02	VN	6
Tlaxcala	19.32	-98.24	MX	6
Akhisar	38.92	27.84	TR	6
Danbury	41.39	-73.45	US	6
Sumenep	-7.01	113.86	ID	6
Ushiku	35.97	140.13	JP	6
Katunayaka	7.17	79.89	LK	6
Yeongju	36.82	128.63	KR	6
Pinheiro	-2.52	-45.08	BR	6
Dacheng	19.51	109.39	CN	6
Bijnor	29.37	78.14	IN	6
Tanjay	9.52	123.16	PH	6
St Albans	51.75	-0.33	GB	6
Fnidek	35.85	-5.36	MA	6
Dhoraji	21.73	70.45	IN	6
East Norwalk	41.11	-73.40	US	6
Gununo	6.92	37.65	ET	6
Āreka	7.07	37.70	ET	6
Edinburg	26.30	-98.16	US	6
Vīrappanchathiram	11.35	77.71	IN	6
Sunrise	26.13	-80.11	US	6
Salina Cruz	16.18	-95.19	MX	6
Dundee	-28.17	30.23	ZA	6
Wilhelmshaven	53.55	8.10	DE	6
Qūş	25.92	32.76	EG	6
Nowy Sącz	49.62	20.70	PL	6
Ogaminana	7.59	6.22	NG	6
Akçapınar	38.95	38.94	TR	6
Kasserine	35.17	8.84	TN	6
Chita	35.00	136.86	JP	6
Karakol	42.49	78.39	KG	6
Piet Retief	-27.01	30.81	ZA	6
Mackay	-21.15	149.17	AU	6
Dazhong	33.20	120.46	CN	6
Ettadhamen	36.83	10.11	TN	6
Suceava	47.63	26.25	RO	6
Heróica Zitácuaro	19.44	-100.36	MX	6
Liaolan	36.67	119.88	CN	6
Bālāghāt	21.82	80.19	IN	6
Trinidad	-14.83	-64.90	BO	6
Phuthaditjhaba	-28.52	28.82	ZA	6
Çerkezköy	41.29	28.00	TR	6
Jinxiang	27.43	120.61	CN	6
Timbuktu	16.77	-3.01	ML	6
Quixadá	-4.97	-39.02	BR	6
Moju	-1.88	-48.77	BR	6
Dongxia	36.75	118.58	CN	6
Saint-Pierre	-21.34	55.48	RE	6
Techiman	7.59	-1.94	GH	6
Kampung Sungai Kajang	3.42	101.17	MY	6
Feni	23.01	91.40	BD	6
Udhampur	32.92	75.14	IN	6
Wanju	35.85	127.15	KR	6
Najībābād	29.61	78.34	IN	6
Wako	35.79	139.62	JP	6
Binonga	10.77	122.98	PH	6
Degan	29.28	106.23	CN	6
Xiannü	32.43	119.56	CN	6
Bāghestān	35.65	51.13	IR	6
Ayase	35.44	139.43	JP	6
Idaiyarpālaiyam	11.04	76.92	IN	6
Higashiyamato	35.76	139.45	JP	6
Cicero	41.85	-87.75	US	6
Darhan	49.49	105.92	MN	6
Paris 10 Entrepôt	48.87	2.36	FR	6
Yinma	36.66	119.46	CN	6
Hemet	33.75	-116.97	US	6
Chiclana de la Frontera	36.42	-6.14	ES	6
Cianorte	-23.66	-52.60	BR	6
Ocotlán	20.35	-102.77	MX	6
Fredrikstad	59.22	10.93	NO	6
Sliven	42.69	26.33	BG	6
South Shields	55.00	-1.43	GB	6
Derry	55.00	-7.31	GB	6
Belo Jardim	-8.34	-36.42	BR	6
Hilversum	52.22	5.18	NL	6
Lingdong	46.55	131.14	CN	6
Nanzhang Chengguanzhen	31.78	111.83	CN	6
Hamma Bouziane	36.41	6.60	DZ	6
Al Qanāţir al Khayrīyah	30.19	31.14	EG	6
Kisilevsk	54.00	86.65	RU	6
Busto Arsizio	45.61	8.85	IT	6
Şabrātah	32.79	12.49	LY	6
Yangp'yŏng	37.49	127.49	KR	6
João Monlevade	-19.81	-43.17	BR	6
Ungsang	35.41	129.17	KR	6
Kafr az Zayyāt	30.82	30.82	EG	6
Johns Creek	34.03	-84.20	US	6
La Piedad de Cabadas	20.34	-102.02	MX	6
Mission	26.22	-98.33	US	6
Yamatokōriyama	34.61	135.77	JP	6
Troy	42.61	-83.15	US	6
São Bento do Sul	-26.25	-49.38	BR	6
Marilao	14.76	120.95	PH	6
Buena Park	33.87	-118.00	US	6
Xucheng	20.33	110.17	CN	6
Ihiala	5.85	6.86	NG	6
Harihar	14.51	75.81	IN	6
Chilla Soroda Bāngar	28.60	77.30	IN	6
Kapiri Mposhi	-13.97	28.67	ZM	6
Carpina	-7.85	-35.25	BR	6
Fort Abbas	29.19	72.86	PK	6
Sirsilla	18.39	78.81	IN	6
Ceuta	35.89	-5.32	ES	6
Sinwŏn-ŭp	38.24	125.76	KP	6
Pori	61.48	21.79	FI	6
Owariasahi	35.21	137.03	JP	6
Margahayukencana	-6.97	107.57	ID	6
Wensu	41.28	80.24	CN	6
Al Khārjah	25.45	30.55	EG	6
Al-Khārijah	25.25	30.55	EG	6
Bulacan	14.79	120.88	PH	6
San José de Guanipa	8.89	-64.17	VE	6
Picos	-7.08	-41.47	BR	6
Amakusa	32.46	130.19	JP	6
Echizen	35.89	136.17	JP	6
Kimitsu	35.35	139.87	JP	6
Galesong	-5.32	119.37	ID	6
Bambari	5.77	20.68	CF	6
Mar del Tuyú	-36.57	-56.69	AR	6
Hecun	36.53	114.11	CN	6
Kamigyō-ku	35.03	135.76	JP	6
Ḩawsh ‘Īsá	30.91	30.29	EG	6
Ningyang	35.76	116.79	CN	6
Bingerville	5.36	-3.89	CI	6
Lodwar	3.12	35.60	KE	6
Karauli	26.50	77.03	IN	6
Mānsa	29.99	75.40	IN	6
Uccle	50.80	4.34	BE	6
Prešov	49.00	21.24	SK	6
David	8.43	-82.43	PA	6
Jinshi	29.60	111.87	CN	6
Weston-super-Mare	51.35	-2.98	GB	6
Palm Coast	29.58	-81.21	US	6
Yuanping	38.72	112.76	CN	6
Minden	52.29	8.91	DE	6
Montego Bay	18.47	-77.92	JM	6
Kraljevo	43.73	20.69	RS	6
Norderstedt	53.70	9.99	DE	6
Sioux City	42.50	-96.40	US	6
Yacuiba	-22.02	-63.68	BO	6
Pontevedra	42.43	-8.64	ES	6
Muhanga	-2.02	29.71	RW	6
Shīrvān	37.40	57.93	IR	6
Marj Al Hamam	31.90	35.85	JO	6
Sobradinho II	-15.63	-47.83	BR	6
Ochota	52.22	20.99	PL	6
Havířov	49.78	18.44	CZ	6
La Villa del Rosario	10.33	-72.31	VE	6
Shikokuchūō	33.98	133.55	JP	6
Bayeux	-7.12	-34.93	BR	6
Atlantis	-33.57	18.48	ZA	6
Aoxi	27.43	115.84	CN	6
Liping	26.23	109.13	CN	6
Pau	43.31	-0.36	FR	6
Rutshuru	-1.19	29.45	CD	6
Kelo	9.31	15.81	TD	6
An Hải	16.07	108.23	VN	6
Sidi Kacem	34.22	-5.71	MA	6
Halifax	53.72	-1.85	GB	6
Torrevieja	37.98	-0.68	ES	6
Changqing	36.56	116.73	CN	6
Jacobina	-11.18	-40.51	BR	6
Malapatan	5.97	125.29	PH	6
Dali Old Town	25.69	100.16	CN	6
Sinhyeon	34.88	128.63	KR	6
Xindian	36.80	118.29	CN	6
San Martín	-33.08	-68.47	AR	6
Jangipur	24.47	88.08	IN	6
Ecunna	-12.68	15.51	AO	6
Muş	38.73	41.48	TR	6
Douar Hicher	36.83	10.09	TN	6
Anzhero-Sudzhensk	56.08	86.02	RU	6
Yima	34.74	111.88	CN	6
Sahand	37.95	46.11	IR	6
Lake Forest	33.65	-117.69	US	6
Pernik	42.60	23.03	BG	6
Qiaoguan	36.56	118.88	CN	6
Manono	-7.30	27.40	CD	6
Merced	37.30	-120.48	US	6
Minyat an Naşr	31.13	31.64	EG	6
Sant Boi de Llobregat	41.34	2.04	ES	6
Pozuelo de Alarcón	40.43	-3.81	ES	6
Bagamoyo	-6.44	38.90	TZ	6
Cukai	4.25	103.42	MY	6
Parit Sulung	1.98	102.88	MY	6
Nangong	37.35	115.39	CN	6
Mbalmayo	3.52	11.50	CM	6
Lüshun	38.80	121.27	CN	6
Troitsk	54.09	61.57	RU	6
Mādabā	31.72	35.79	JO	6
Maţāy	28.42	30.78	EG	6
Hengelo	52.27	6.79	NL	6
Reef Al Fujairah City	25.14	56.25	AE	6
Nizip	37.01	37.79	TR	6
Nakhon Sawan	15.70	100.14	TH	6
Colombes	48.92	2.25	FR	6
Lākshām	23.24	91.12	BD	6
Longview	32.50	-94.74	US	6
Gobindgarh	30.67	76.30	IN	6
Dondo	-19.61	34.74	MZ	6
Maple Ridge	49.22	-122.60	CA	6
Macaíba	-5.86	-35.35	BR	6
Caldas	6.09	-75.64	CO	6
Ōmihachiman	35.13	136.10	JP	6
Atambua	-9.11	124.89	ID	6
Anguo	34.83	116.82	CN	6
Quixeramobim	-5.20	-39.29	BR	6
Fatsa	41.03	37.50	TR	6
Três Rios	-22.12	-43.21	BR	6
Azov	47.11	39.41	RU	6
Pagbilao	13.97	121.70	PH	6
Bryan	30.67	-96.37	US	6
Ipoti	7.87	5.08	NG	6
Shiwan	23.00	113.08	CN	6
Arcoverde	-8.42	-37.05	BR	6
Edmonton	51.63	-0.06	GB	6
Westland	42.32	-83.40	US	6
Ishwardi	24.13	89.07	BD	6
Tamworth	52.63	-1.70	GB	6
Limay	14.56	120.60	PH	6
Bolgatanga	10.79	-0.85	GH	6
Donghe	32.23	106.30	CN	6
Gosport	50.80	-1.13	GB	6
La Dorada	5.45	-74.66	CO	6
Le Tampon	-21.28	55.52	RE	6
Ratodero	27.80	68.29	PK	6
Saunda	23.66	85.33	IN	6
Akiruno	35.73	139.23	JP	6
Breña	-12.06	-77.05	PE	6
Presidencia Roque Sáenz Peña	-26.79	-60.44	AR	6
Maraimalainagar	12.80	80.03	IN	6
Huaiyang	37.76	114.52	CN	6
Coslada	40.42	-3.56	ES	6
Ashoknagar	24.58	77.73	IN	6
Qal‘at Bīshah	20.00	42.61	SA	6
Sesto San Giovanni	45.53	9.23	IT	6
Agboville	5.93	-4.21	CI	6
Villingen-Schwenningen	48.06	8.49	DE	6
Tamanghasset	22.79	5.52	DZ	6
Kaspiysk	42.88	47.64	RU	6
Lucca	43.84	10.50	IT	6
Babamba	0.18	27.48	CD	6
Phulwari Sharif	25.58	85.07	IN	6
Tangping	22.03	111.94	CN	6
Ar Rass	25.87	43.50	SA	6
Mhow	22.56	75.77	IN	6
Warwick	41.70	-71.42	US	6
Bartın	41.64	32.34	TR	6
Luzern	47.05	8.31	CH	6
Concórdia	-27.23	-52.03	BR	6
Al Khānkah	30.21	31.37	EG	6
Kasongo	-4.43	26.67	CD	6
Guider	9.93	13.95	CM	6
Salmās	38.20	44.77	IR	6
Yirga ‘Alem	6.75	38.42	ET	6
An Khê	13.95	108.65	VN	6
Naqadeh	36.96	45.39	IR	6
Timóteo	-19.58	-42.65	BR	6
Scunthorpe	53.58	-0.65	GB	6
Tiznit	29.70	-9.73	MA	6
Muntilan	-7.58	110.29	ID	6
Paysandú	-32.32	-58.08	UY	6
Uman	48.75	30.22	UA	6
Pacatuba	-3.98	-38.62	BR	6
Yan Nawa	13.70	100.54	TH	6
Tianguá	-3.73	-40.99	BR	6
Remedios de Escalada de San Martín	-34.73	-58.40	AR	6
Yudong	29.39	106.52	CN	6
Malout	30.21	74.48	IN	6
Kadi	23.30	72.33	IN	6
Bulungu	-4.54	18.60	CD	6
Chapadinha	-3.74	-43.36	BR	6
Balqash	46.85	74.98	KZ	6
Guaynabo	18.36	-66.11	PR	6
Farmington Hills	42.49	-83.38	US	6
Sarishābāri	24.75	89.83	BD	6
Fatehjang	33.56	72.64	PK	6
San Tan Valley	33.19	-111.53	US	6
Mount Pleasant	32.79	-79.86	US	6
Athi River	-1.46	36.98	KE	6
Lagoa Santa	-19.63	-43.90	BR	6
Lambayong	6.52	125.04	PH	6
Konstanz	47.66	9.18	DE	6
Tatebayashi	36.25	139.53	JP	6
Mweka	-4.85	21.56	CD	6
Konin	52.22	18.25	PL	6
Nangen	35.41	127.39	KR	6
Vijalpor	20.92	72.91	IN	6
Pozzuoli	40.84	14.10	IT	6
Reşiţa	45.30	21.89	RO	6
Žilina	49.22	18.74	SK	6
Palakollu	16.52	81.73	IN	6
Kabalo	-6.05	26.91	CD	6
Baudhuinville	-7.08	29.74	CD	6
Sokcho	38.21	128.59	KR	6
Xiugu	27.91	116.78	CN	6
Himatnagar	23.60	72.97	IN	6
Lalupon	7.47	4.07	NG	6
Pilar	-34.46	-58.91	AR	6
Al Ḩurshah	32.76	12.67	LY	6
Worms	49.63	8.36	DE	6
Cranston	41.78	-71.44	US	6
Ozersk	55.76	60.70	RU	6
Tallaght	53.29	-6.37	IE	6
Rockhampton	-23.38	150.51	AU	6
San Timoteo	9.79	-71.07	VE	6
Yessentuki	44.05	42.86	RU	6
Vitry-sur-Seine	48.79	2.40	FR	6
Largo	27.91	-82.79	US	6
Naesŏ	35.25	128.52	KR	6
Diyarb Najm	30.75	31.44	EG	6
Dholka	22.73	72.44	IN	6
Feicheng	35.26	117.97	CN	6
Aveiro	40.65	-8.65	PT	6
Ravenna	44.41	12.20	IT	6
Shanting	35.08	117.46	CN	6
Rouissat	31.92	5.35	DZ	6
Madido	-15.35	28.37	ZM	6
Klin	56.33	36.73	RU	6
Getxo	43.36	-3.01	ES	6
Buta	2.79	24.73	CD	6
Kotkapura	30.58	74.83	IN	6
Homestead	25.47	-80.48	US	6
Junlian	28.17	104.51	CN	6
Lecce	40.35	18.17	IT	6
South Suffolk	36.72	-76.59	US	6
Avondale	33.44	-112.35	US	6
Atakpamé	7.53	1.13	TG	6
Curvelo	-18.76	-44.43	BR	6
Lai Vung	10.26	105.59	VN	6
Mijas	36.60	-4.64	ES	6
Güigüe	10.08	-67.78	VE	6
Bargarh	21.33	83.62	IN	6
Nianzhuang	34.30	117.77	CN	6
Aulnay-sous-Bois	48.94	2.49	FR	6
Kharghar	19.05	73.07	IN	6
Tepeji del Río de Ocampo	19.90	-99.34	MX	6
Kōtari	34.92	135.71	JP	6
Chatham	51.38	0.53	GB	6
Varese	45.82	8.83	IT	6
Tustin	33.75	-117.83	US	6
Santa Catarina Pinula	14.57	-90.50	GT	6
Bustos	14.96	120.92	PH	6
Samā’il	23.30	57.95	OM	6
Khemis Miliana	36.26	2.22	DZ	6
Ambalantota	6.12	81.02	LK	6
Bakhmut	48.59	38.00	UA	6
Bani Yas City	24.31	54.63	AE	6
Água Rasa	-20.43	-45.17	BR	6
Yingjiang	24.71	97.94	CN	6
Elbistan	38.21	37.20	TR	6
Kondoa	-4.90	35.78	TZ	6
Serrinha	-11.66	-39.01	BR	6
Mountain View	37.39	-122.08	US	6
Napa	38.30	-122.29	US	6
Kairāna	29.40	77.21	IN	6
Brajarajnagar	21.82	83.92	IN	6
Zhuanghe	39.70	122.99	CN	6
Hannō	35.85	139.32	JP	6
Bonāb	37.34	46.06	IR	6
Loushanguan	28.14	106.82	CN	6
Somerville	42.39	-71.10	US	6
Kāmāreddi	18.32	78.34	IN	6
Baoying	33.23	119.31	CN	6
Giugliano in Campania	40.93	14.20	IT	6
Kedungwaru	-8.07	111.92	ID	6
Kendall	25.68	-80.32	US	6
Dashiqiao	40.64	122.50	CN	6
Panshi	42.94	126.06	CN	6
Palwancha	17.58	80.68	IN	6
Neumünster	54.07	9.98	DE	6
Serpong	-6.32	106.66	ID	6
Meru	0.05	37.66	KE	6
Piotrków Trybunalski	51.41	19.70	PL	6
Purmerend	52.51	4.96	NL	6
Qŭnghirot	43.04	58.84	UZ	6
Alahabad	30.88	74.06	PK	6
Nyeri	-0.42	36.95	KE	6
Cachoeira do Sul	-30.04	-52.89	BR	6
Gamagōri	34.83	137.23	JP	6
Manmād	20.25	74.44	IN	6
Srikalahasti	13.76	79.70	IN	6
Huanglou	36.65	118.61	CN	6
Dushan	25.83	107.53	CN	6
Kanyama	-7.52	24.17	CD	6
Vorkuta	67.51	64.07	RU	6
Sangmélima	2.93	11.98	CM	6
Três Corações	-21.70	-45.25	BR	6
Rikaze	29.25	88.88	CN	6
Sha Tin Wai	22.38	114.20	HK	6
Hajiawa	36.24	44.79	IQ	6
Khewra	32.65	73.01	PK	6
Cung Kiệm	21.19	106.16	VN	6
Ughelli	5.49	6.00	NG	6
Dorsten	51.66	6.97	DE	6
Stockton-on-Tees	54.57	-1.32	GB	6
Tan-Tan	28.44	-11.10	MA	6
Parma	41.40	-81.72	US	6
Miabi	-6.22	23.39	CD	6
Drobeta-Turnu Severin	44.63	22.65	RO	6
New Rochelle	40.91	-73.78	US	6
San José Pinula	14.55	-90.41	GT	6
Kottagūdem	17.55	80.62	IN	6
Lynchburg	37.41	-79.14	US	6
Lelystad	52.51	5.47	NL	6
Medford	42.33	-122.88	US	6
Telêmaco Borba	-24.32	-50.62	BR	6
Zrenjanin	45.38	20.38	RS	6
Deerfield Beach	26.32	-80.10	US	6
Songlou	34.57	116.60	CN	6
Pongch’ŏn-ŭp	38.12	126.20	KP	6
Bella Vista	-34.57	-58.69	AR	6
San Francisco	8.54	125.95	PH	6
Lerdo	25.54	-103.52	MX	6
Taixing	32.17	120.01	CN	6
Genteng	-8.37	114.15	ID	6
Kidapawan	7.01	125.09	PH	6
Bolenge	0.00	18.22	CD	6
Amstelveen	52.30	4.86	NL	6
Bende	5.56	7.63	NG	6
Kropotkin	45.44	40.57	RU	6
Itumbiara	-18.42	-49.22	BR	6
Calarcá	4.53	-75.64	CO	6
Oke Mesi	7.82	4.92	NG	6
Kimpese	-5.56	14.43	CD	6
Khrustalnyi	48.14	38.92	UA	6
Kafanchan	9.58	8.29	NG	6
Edfu	24.98	32.88	EG	6
Pleasanton	37.66	-121.87	US	6
Tangjiazhuang	39.74	118.45	CN	6
São Roque	-23.53	-47.14	BR	6
Shadrinsk	56.09	63.64	RU	6
Willowdale	43.77	-79.40	CA	6
Talagang	32.93	72.42	PK	6
Huehuetenango	15.32	-91.47	GT	6
Dosso	13.05	3.19	NE	6
Lüdenscheid	51.22	7.63	DE	6
Zarzis	33.50	11.11	TN	6
Phuket	7.89	98.40	TH	6
Kahna Nau	31.37	74.37	PK	6
Polotsk	55.49	28.79	BY	6
Tefé	-3.37	-64.72	BR	6
Sant Cugat del Vallès	41.47	2.09	ES	6
Nawābganj	26.93	81.20	IN	6
Gedangan	-7.39	112.73	ID	6
Cyberjaya	2.92	101.66	MY	6
Yanta	36.24	115.67	CN	6
Bwizibwera	-0.59	30.63	UG	6
Brooklyn Park	45.09	-93.36	US	6
Gueckedou	8.57	-10.13	GN	6
Gokak	16.17	74.82	IN	6
Ceará-Mirim	-5.63	-35.43	BR	6
Mamou	10.38	-12.09	GN	6
Zhuangyuan	37.31	120.83	CN	6
Tīkamgarh	24.74	78.83	IN	6
Ikom	5.97	8.71	NG	6
Arakkonam	13.08	79.67	IN	6
Wuyang	31.99	116.25	CN	6
Kashihara	34.58	135.62	JP	6
Xiongzhou	25.12	114.30	CN	6
Chaigou	36.25	119.62	CN	6
Būmahen	35.73	51.87	IR	6
Matão	-21.60	-48.37	BR	6
Ponorogo	-7.87	111.46	ID	6
Arāria	26.15	87.51	IN	6
Agulu	6.10	7.06	NG	6
Netrakona	24.88	90.73	BD	6
Goodyear	33.44	-112.36	US	6
Kaambooni	-1.64	41.59	SO	6
Alfenas	-21.43	-45.95	BR	6
Catanzaro	38.88	16.60	IT	6
Prince George	53.92	-122.75	CA	6
Mossel Bay	-34.18	22.15	ZA	6
Nakatsugawa	35.48	137.50	JP	6
New Westminster	49.21	-122.91	CA	6
Kennewick	46.21	-119.14	US	6
Marburg an der Lahn	50.81	8.77	DE	6
Bistriţa	47.13	24.50	RO	6
Marseille 08	43.27	5.38	FR	6
Cẩm Lệ	16.02	108.20	VN	6
Shitanjing	39.23	106.34	CN	6
Coffs Harbour	-30.30	153.11	AU	6
Chiang Rai	19.91	99.83	TH	6
Deurne	51.22	4.47	BE	6
Sagaing	21.88	95.98	MM	6
Koch Bihār	26.33	89.45	IN	6
Mooka	36.43	140.02	JP	6
Tumen	42.97	129.84	CN	6
Natori-shi	38.17	140.88	JP	6
Avilés	43.55	-5.92	ES	6
Armant	25.62	32.54	EG	6
Kharakvasla	18.44	73.78	IN	6
Gualeguaychú	-33.01	-58.52	AR	6
Thanhlyin	16.78	96.25	MM	6
Isiolo	0.35	37.58	KE	6
Vyborg	60.71	28.75	RU	6
Alameda	37.77	-122.26	US	6
Palencia	42.01	-4.52	ES	6
Curepipe	-20.32	57.53	MU	6
Danané	7.26	-8.15	CI	6
Arona	28.10	-16.68	ES	6
Waliso	8.53	37.97	ET	6
Tupi	6.33	124.95	PH	6
Qinggang	29.47	106.24	CN	6
Hengbei	23.88	115.73	CN	6
Honjō	36.24	139.19	JP	6
Bhadohi	25.40	82.57	IN	6
Torrent	39.44	-0.47	ES	6
Lins	-21.68	-49.74	BR	6
Carlisle	54.90	-2.94	GB	6
Town 'n' Country	28.01	-82.58	US	6
Bellflower	33.88	-118.12	US	6
Yishan	36.22	118.70	CN	6
Kātoya	23.65	88.13	IN	6
Youhao	47.85	128.84	CN	6
Joensuu	62.60	29.76	FI	6
Medininagar	24.04	84.07	IN	6
Wāshīm	20.11	77.13	IN	6
Reutov	55.76	37.86	RU	6
Bagbera	22.76	86.19	IN	6
Savarkundla	21.34	71.30	IN	6
Bandar-e Emam Khomeyni	30.44	49.10	IR	6
Toyooka	35.54	134.82	JP	6
Putatan	5.93	116.06	MY	6
Chino Hills	33.99	-117.76	US	6
Bang Kruai	13.80	100.47	TH	6
Denov	38.27	67.90	UZ	6
Basoda	23.85	77.94	IN	6
Santa Cruz del Quiché	15.03	-91.15	GT	6
Daura	11.55	11.41	NG	6
Al Ḩayy	32.17	46.04	IQ	6
Bamban	15.27	120.57	PH	6
Pingyi	35.50	117.63	CN	6
Southall	51.51	-0.37	GB	6
Wulong	29.32	107.76	CN	6
Valvedditturai	9.82	80.17	LK	6
Linping	30.42	120.30	CN	6
Huai Khwang	13.78	100.58	TH	6
Sirs al Layyānah	30.44	30.97	EG	6
Ilioúpoli	37.93	23.77	GR	6
San Juan	-3.78	-73.28	PE	6
Zahlé	33.85	35.90	LB	6
Daet	14.11	122.96	PH	6
Daugavpils	55.88	26.53	LV	6
Rugby	52.37	-1.26	GB	6
Kashiba	34.53	135.71	JP	6
Alafaya	28.56	-81.21	US	6
Wa	10.06	-2.50	GH	6
Vanadzor	40.81	44.50	AM	6
Kouvola	60.87	26.70	FI	6
Donggongon	5.91	116.10	MY	6
Szombathely	47.23	16.62	HU	6
Matala	-14.73	15.03	AO	6
Colón	9.36	-79.90	PA	6
Kuacjok	8.30	27.98	SS	6
Tanuku	16.75	81.68	IN	6
Gurdaspur	32.04	75.40	IN	6
Castrop-Rauxel	51.56	7.31	DE	6
Marsala	37.80	12.44	IT	6
Kizugawa	34.74	135.84	JP	6
Pakse	15.12	105.80	LA	6
Tome	38.71	141.16	JP	6
Springdale	36.19	-94.13	US	6
Luleå	65.58	22.15	SE	6
Edattala	10.06	76.38	IN	6
Shap Pat Heung	22.42	114.04	HK	6
Marseille 15	43.37	5.35	FR	6
Jardim Botânico	-15.87	-47.81	BR	6
Huankou	34.87	116.67	CN	6
Ciranjang-hilir	-6.82	107.26	ID	6
Linkou	45.28	130.27	CN	6
Nchelenge	-9.35	28.73	ZM	6
Racine	42.73	-87.78	US	6
Ipiales	0.83	-77.64	CO	6
Roosendaal	51.53	4.47	NL	6
Hakkâri	37.57	43.74	TR	6
Ukunda	-4.29	39.56	KE	6
Bauang	16.53	120.33	PH	6
Nikkō	36.75	139.62	JP	6
Hasselt	50.93	5.34	BE	6
Keningau	5.34	116.16	MY	6
Gateshead	54.96	-1.60	GB	6
Huangmei	30.19	116.02	CN	6
Campo Limpo Paulista	-23.21	-46.78	BR	6
Numan	9.46	12.03	NG	6
Hammond	41.58	-87.50	US	6
Ītāy al Bārūd	30.89	30.67	EG	6
Milpitas	37.43	-121.91	US	6
Ouarzazate	30.92	-6.89	MA	6
Inowrocław	52.80	18.26	PL	6
Ünye	41.14	37.29	TR	6
Bodhan	18.66	77.89	IN	6
Santo Ângelo	-28.30	-54.26	BR	6
Songling	31.19	120.72	CN	6
Jishui	33.73	115.40	CN	6
Aalst	50.94	4.04	BE	6
Lubin	51.40	16.20	PL	6
Mechelen	51.03	4.48	BE	6
Lisburn	54.52	-6.04	GB	6
Welk’īt’ē	8.28	37.78	ET	6
Bagong Barrio	14.67	120.99	PH	6
Kambar	27.59	68.00	PK	6
Nazareth	32.70	35.30	IL	6
Mazatenango	14.53	-91.50	GT	6
Khomeyn	33.64	50.08	IR	6
Shulan	44.41	126.95	CN	6
Balrāmpur	27.43	82.19	IN	6
Tsubame	37.66	138.93	JP	6
Mandela	5.55	-0.34	GH	6
Suva	-18.14	178.43	FJ	6
Jelenia Góra	50.90	15.73	PL	6
Matehuala	23.65	-100.64	MX	6
Gebiley	9.70	43.62	SO	6
Quatre Bornes	-20.26	57.48	MU	6
Fukuchiyama	35.30	135.12	JP	6
Mungyeong	36.59	128.20	KR	6
Bāramūla	34.21	74.34	IN	6
Paisley	55.83	-4.43	GB	6
Keur Médoune	14.76	-15.90	SN	6
Agua Prieta	31.32	-109.54	MX	6
Pesaro	43.91	12.92	IT	6
Kanasín	20.93	-89.56	MX	6
Cozumel	20.50	-86.94	MX	6
Lod	31.95	34.89	IL	6
Wawer	52.20	21.18	PL	6
Aş Şuwayrah	32.93	44.78	IQ	6
Siedlce	52.17	22.29	PL	6
Damiao	34.26	117.36	CN	6
Jiexiu	37.02	111.91	CN	6
Santa Cruz de Barahona	18.21	-71.10	DO	6
Gary	41.59	-87.35	US	6
Shūsh	32.19	48.24	IR	6
Karwar	14.81	74.13	IN	6
Ovalle	-30.60	-71.20	CL	6
Kunitachi	35.68	139.44	JP	6
Scranton	41.41	-75.66	US	6
Şurmān	32.76	12.57	LY	6
Mafikeng	-25.87	25.64	ZA	6
Coyah	9.71	-13.38	GN	6
Pok Fu Lam	22.27	114.13	HK	6
Voskresensk	55.31	38.69	RU	6
Canaã dos Carajás	-6.52	-49.85	BR	6
Keratsíni	37.96	23.62	GR	6
Baldwin Park	34.09	-117.96	US	6
Dhuliān	24.68	87.95	IN	6
Yên Hòa	21.02	105.79	VN	6
Hunchun	42.87	130.36	CN	6
Nabari	34.62	136.08	JP	6
Kagoro	9.61	8.39	NG	6
Auburn	47.31	-122.23	US	6
Rabkavi-Banhatti	16.47	75.12	IN	6
Yalta	44.50	34.17	UA	6
Hassi Bahbah	35.07	3.03	DZ	6
Zahir Pir	28.81	70.52	PK	6
Mawāna	29.10	77.92	IN	6
Tsurusaki	33.25	131.69	JP	6
Santa Rosa	-27.87	-54.48	BR	6
Sarqant	45.41	79.92	KZ	6
Shirpur	21.35	74.88	IN	6
Kiserian	-1.43	36.69	KE	6
Marseille 09	43.25	5.41	FR	6
Puerto Padre	21.20	-76.60	CU	6
Budge Budge	22.48	88.18	IN	6
Arraiján	8.94	-79.64	PA	6
La Rochelle	46.16	-1.15	FR	6
Kundla	21.34	71.31	IN	6
Fishers	39.96	-86.01	US	6
Shrewsbury	52.71	-2.75	GB	6
Saint Joseph	39.77	-94.85	US	6
Biguaçu	-27.49	-48.66	BR	6
Sandu	19.79	109.22	CN	6
Visnagar	23.70	72.55	IN	6
Liangxiang	39.74	116.13	CN	6
Champigny-sur-Marne	48.82	2.49	FR	6
Melong	5.12	9.96	CM	6
Brookes Point	8.77	117.84	PH	6
Kannauj	27.06	79.92	IN	6
Zhaodun	34.30	117.86	CN	6
Luxembourg	49.61	6.13	LU	6
Yenakiyeve	48.24	38.20	UA	6
La Louvière	50.49	4.19	BE	6
Pančevo	44.87	20.64	RS	6
Fenghua	29.66	121.41	CN	6
Khajoori Khas	28.71	77.26	IN	6
Rueil-Malmaison	48.88	2.19	FR	6
Neelankarai	12.95	80.26	IN	6
Nagīna	29.44	78.44	IN	6
Caledon	43.87	-79.99	CA	6
Juhaynah	26.67	31.50	EG	6
Biruaca	7.84	-67.52	VE	6
Vinhedo	-23.03	-46.98	BR	6
Pharr	26.19	-98.18	US	6
Fuorigrotta	40.83	14.20	IT	6
Fylde	53.83	-2.92	GB	6
Badagara	11.60	75.58	IN	6
Fazilka	30.40	74.03	IN	6
Rheine	52.29	7.44	DE	6
Hujra Shah Muqim	30.74	73.82	PK	6
Bawku	11.06	-0.24	GH	6
Bunbury	-33.33	115.64	AU	6
Shiki	35.83	139.58	JP	6
Upland	34.10	-117.65	US	6
Crewe	53.10	-2.44	GB	6
Viçosa	-20.75	-42.88	BR	6
Oss	51.77	5.52	NL	6
Yaxing	19.45	109.26	CN	6
Yuktae-dong	40.02	128.16	KP	6
Dangkao	11.51	104.89	KH	6
Ciudad Satelite	-16.43	-71.53	PE	6
Antibes	43.58	7.12	FR	6
Crateús	-5.18	-40.67	BR	6
Yangliuqing	39.14	117.00	CN	6
Stoney Creek	43.22	-79.77	CA	6
Folsom	38.68	-121.18	US	6
Modiin Ilit	31.93	35.04	IL	6
Bebedouro	-20.95	-48.48	BR	6
Basoko	1.24	23.62	CD	6
Odendaalsrus	-27.87	26.69	ZA	6
Thawi Watthana	13.78	100.38	TH	6
Electronic City Phase I	12.85	77.66	IN	6
Aira	31.77	130.59	JP	6
Qiuji	33.80	118.00	CN	6
Baytown	29.74	-94.98	US	6
Sant'Ana do Livramento	-30.89	-55.53	BR	6
Furukawa	38.57	140.96	JP	6
Latina	41.47	12.90	IT	6
Zhlobin	52.89	30.02	BY	6
Mineralnye Vody	44.21	43.14	RU	6
Babahoyo	-1.80	-79.52	EC	6
Midyat	37.42	41.34	TR	6
Lae	-6.72	147.00	PG	6
Matara	5.95	80.54	LK	6
Manresa	41.73	1.82	ES	6
Nahāvand	34.19	48.37	IR	6
Ramla	31.93	34.86	IL	6
Tuban	-6.90	112.06	ID	6
Thanh Liệt	20.97	105.82	VN	6
Sakon Nakhon	17.16	104.15	TH	6
Ratnagiri	16.99	73.31	IN	6
Mbabane	-26.32	31.13	SZ	6
Kiyose	35.78	139.53	JP	6
Keshod	21.30	70.25	IN	6
Qingquan	30.45	115.26	CN	6
Viersen	51.25	6.39	DE	6
Esteio	-29.86	-51.18	BR	6
San Ramon	37.78	-121.98	US	6
Adzopé	6.11	-3.86	CI	6
Camden	39.93	-75.12	US	6
Bracknell	51.41	-0.75	GB	6
Shibukawa	36.48	139.00	JP	6
Oleksandriya	48.67	33.12	UA	6
Konnagar	22.71	88.34	IN	6
Shirbīn	31.20	31.52	EG	6
Yurihonjō	39.39	140.06	JP	6
Ash Shuhadā’	30.60	30.90	EG	6
Lake Charles	30.21	-93.20	US	6
Chintamani	13.40	78.05	IN	6
Kalamazoo	42.29	-85.59	US	6
Shouxian	34.85	116.46	CN	6
Paharpur	32.11	70.97	PK	6
Brick	40.06	-74.14	US	6
Kebomas	-7.17	112.63	ID	6
Cinisello Balsamo	45.56	9.21	IT	6
Itapema	-27.09	-48.61	BR	6
Arlington Heights	42.09	-87.98	US	6
San Sebastián de los Reyes	40.56	-3.63	ES	6
Plymouth	45.01	-93.46	US	6
Maymana	35.92	64.78	AF	6
Delmenhorst	53.05	8.63	DE	6
Lintong	34.38	109.21	CN	6
La Libertad	-2.23	-80.91	EC	6
Doral	25.82	-80.36	US	6
Ciudad Choluteca	13.31	-87.18	HN	6
Karangsembung	-6.85	108.64	ID	6
Buchanan	5.88	-10.05	LR	6
Mashtūl as Sūq	30.36	31.38	EG	6
Sindhnūr	15.77	76.76	IN	6
Sankt Gallen	47.42	9.37	CH	6
Kamensk-Shakhtinsky	48.32	40.26	RU	6
Belovo	54.42	86.30	RU	6
Takefu	35.90	136.17	JP	6
Tarub	-6.93	109.17	ID	6
Waterford	42.69	-83.41	US	6
Madhubani	26.35	86.07	IN	6
Kageleke	37.30	79.60	CN	6
Kotido	2.98	34.13	UG	6
Turbat	26.00	63.05	PK	6
Bodināyakkanūr	10.01	77.35	IN	6
Kanjia	36.37	119.58	CN	6
Yinzhu	35.88	119.98	CN	6
Khadki	18.56	73.85	IN	6
Sapiranga	-29.64	-51.01	BR	6
Chekhov	55.15	37.46	RU	6
Bihać	44.82	15.87	BA	6
Souk El Arbaa	34.68	-6.00	MA	6
Battaramulla South	6.90	79.92	LK	6
Warabi	35.82	139.69	JP	6
Ibiúna	-23.66	-47.22	BR	6
Kita	13.04	-9.49	ML	6
Gare	48.83	2.38	FR	6
Dhrāngadhra	22.99	71.47	IN	6
Tezpur	26.63	92.80	IN	6
Osijek	45.55	18.69	HR	6
Piła	53.15	16.74	PL	6
Nevşehir	38.62	34.71	TR	6
Evanston	42.04	-87.69	US	6
Gladbeck	51.57	6.99	DE	6
Ode	7.79	5.71	NG	6
Miki	34.80	134.98	JP	6
Manteca	37.80	-121.22	US	6
Schiedam	51.92	4.39	NL	6
Ra'anana	32.18	34.87	IL	6
Saint-Maur-des-Fossés	48.79	2.49	FR	6
Srivilliputhur	9.51	77.63	IN	6
Bariq	18.93	41.93	SA	6
Ulu Tiram	1.60	103.82	MY	6
Dawbon	16.52	95.60	MM	6
Benipur	26.06	86.15	IN	6
Ekpé	6.39	2.54	BJ	6
Kai	35.68	138.51	JP	6
East Kilbride	55.76	-4.18	GB	6
Wyoming	42.91	-85.71	US	6
Kruševac	43.58	21.33	RS	6
Hongch’ŏn	37.69	127.89	KR	6
Kampong Chhnang	12.25	104.67	KH	6
Trujillo Alto	18.35	-66.01	PR	6
Shangmei	27.74	111.30	CN	6
Pāloncha	17.60	80.71	IN	6
Igbo-Ukwu	6.02	7.02	NG	6
Mek’ī	8.15	38.82	ET	6
Loveland	40.40	-105.07	US	6
Rundu	-17.92	19.77	NA	6
Cheektowaga	42.90	-78.75	US	6
Hove	50.83	-0.17	GB	6
Virac	13.58	124.24	PH	6
Pedro Juan Caballero	-22.55	-55.74	PY	6
Bismarck	46.81	-100.78	US	6
Basyūn	30.94	30.81	EG	6
Kpalimé	6.90	0.63	TG	6
Okegawa	36.00	139.56	JP	6
Kumanovo	42.13	21.72	MK	6
Barbalha	-7.31	-39.30	BR	6
Katano	34.79	135.69	JP	6
Gela	37.07	14.24	IT	6
Barra do Dande	-8.47	13.37	AO	6
Feriana	34.95	8.57	TN	6
Katoro	-3.00	31.93	TZ	6
Củ Chi	10.97	106.49	VN	6
Sukagawa	37.28	140.38	JP	6
Spijkenisse	51.84	4.33	NL	6
Encarnación	-27.33	-55.87	PY	6
Aprilia	41.59	12.65	IT	6
Xinying	23.31	120.31	TW	6
Perris	33.78	-117.23	US	6
Haninge	59.17	18.14	SE	6
Cruzeiro	-22.57	-44.97	BR	6
Maozhou	22.76	113.81	CN	6
Jaora	23.64	75.13	IN	6
Bethlehem	40.63	-75.37	US	6
Gävle	60.67	17.14	SE	6
Arnsberg	51.38	8.08	DE	6
Topi	34.07	72.62	PK	6
Molepolole	-24.41	25.50	BW	6
Tura	25.51	90.20	IN	6
Gūdūr	14.15	79.85	IN	6
El Tocuyo	9.79	-69.79	VE	6
Hihyā	30.67	31.59	EG	6
Ouro Preto	-20.39	-43.51	BR	6
Huilong	31.81	121.66	CN	6
Keren	15.78	38.45	ER	6
Ubud	-8.51	115.27	ID	6
Nam Cheong	22.33	114.15	HK	6
Beidao	34.57	105.89	CN	6
Troisdorf	50.81	7.15	DE	6
Moroni	-11.70	43.26	KM	6
Aylesbury	51.82	-0.81	GB	6
Valdemoro	40.19	-3.68	ES	6
Bhalwal	32.27	72.90	PK	6
Ciudad Real	38.99	-3.93	ES	6
Helmond	51.48	5.66	NL	6
Yanggu	36.11	115.78	CN	6
Alicia	16.78	121.70	PH	6
Schaumburg	42.03	-88.08	US	6
Am Timan	11.04	20.28	TD	6
Évosmos	40.67	22.91	GR	6
Changnyeong	35.54	128.50	KR	6
Mirpur Mathelo	28.02	69.55	PK	6
Gobernador Gálvez	-33.03	-60.64	AR	6
Jōyō	34.84	135.81	JP	6
Banská Bystrica	48.74	19.15	SK	6
Asbest	57.01	61.46	RU	6
Narnaul	28.04	76.11	IN	6
Sunāmganj	25.07	91.40	BD	6
Cannes	43.55	7.01	FR	6
Gastonia	35.26	-81.19	US	6
Senhor do Bonfim	-10.46	-40.19	BR	6
Irecê	-11.30	-41.86	BR	6
Hyosha	0.70	29.52	CD	6
Balotra	25.83	72.24	IN	6
Union City	37.60	-122.02	US	6
Bismil	37.85	40.66	TR	6
Aramoko-Ekiti	7.70	5.04	NG	6
Katori-shi	35.90	140.50	JP	6
Kharar	30.75	76.65	IN	6
Shancheng	34.80	116.08	CN	6
Bilecik	40.14	29.98	TR	6
Zhangzhai	34.62	116.95	CN	6
Calais	50.95	1.86	FR	6
Izumiōtsu	34.50	135.40	JP	6
Nanma	36.18	118.15	CN	6
Méagui	5.41	-6.56	CI	6
Iţsā	29.24	30.79	EG	6
Asti	44.90	8.21	IT	6
Foumbot	5.51	10.63	CM	6
Tatsuno	34.83	134.54	JP	6
Bolingbrook	41.70	-88.07	US	6
Yadgir	16.77	77.14	IN	6
Bosaso	11.28	49.18	SO	6
Rāmhormoz	31.28	49.60	IR	6
Kilifi	-3.63	39.85	KE	6
Harda	22.34	77.10	IN	6
Yuanshang	36.77	120.35	CN	6
Ragusa	36.93	14.72	IT	6
Silao de la Victoria	20.94	-101.43	MX	6
Iowa City	41.66	-91.53	US	6
Pilkhua	28.71	77.66	IN	6
Seosan	36.78	126.45	KR	6
Tosu	33.37	130.52	JP	6
Khalándrion	38.02	23.80	GR	6
Vélez-Málaga	36.78	-4.10	ES	6
Canindé	-4.36	-39.31	BR	6
Suixi	33.89	116.77	CN	6
Eusébio	-3.89	-38.45	BR	6
Layton	41.06	-111.97	US	6
Xinmin	41.99	122.83	CN	6
Missouri City	29.62	-95.54	US	6
Appleton	44.26	-88.42	US	6
Igbara-Odo	7.50	5.06	NG	6
Zhangzhuang	34.52	117.01	CN	6
Ambājogāi	18.73	76.39	IN	6
Meshgīn Shahr	38.40	47.68	IR	6
Al Qā’im	34.39	40.99	IQ	6
Shelby	42.67	-83.03	US	6
Fuentes del Valle	19.63	-99.14	MX	6
Imerintsiatosika	-18.98	47.32	MG	6
Béziers	43.34	3.21	FR	6
Kāpas Herd	28.53	77.08	IN	6
Bafia	4.75	11.23	CM	6
Gucheng Chengguanzhen	32.27	111.63	CN	6
Xianshuigu	38.98	117.38	CN	6
Zaraza	9.35	-65.32	VE	6
Fort Myers	26.62	-81.84	US	6
Inuyama	35.38	136.94	JP	6
Bela	25.92	82.00	IN	6
Ostrowiec Świętokrzyski	50.93	21.39	PL	6
Sarai Alamgir	32.90	73.76	PK	6
Boynton Beach	26.53	-80.07	US	6
Wattenscheid	51.48	7.14	DE	6
Bocholt	51.84	6.62	DE	6
Yunyang	33.45	112.71	CN	6
Casoria	40.91	14.29	IT	6
Msalātah	32.58	14.04	LY	6
Jonesboro	35.84	-90.70	US	6
Majene	-3.54	118.97	ID	6
Kortrijk	50.83	3.26	BE	6
Grajaú	-5.82	-46.14	BR	6
Youssoufia	32.25	-8.53	MA	6
Sipalay	9.75	122.40	PH	6
Gbadolite	4.28	21.00	CD	6
Rabkavi	16.48	75.11	IN	6
Pistoia	43.93	10.92	IT	6
Chimbas	-31.49	-68.53	AR	6
Gandia	38.97	-0.18	ES	6
Prilep	41.35	21.55	MK	6
Ozubulu	5.96	6.85	NG	6
Vlaardingen	51.91	4.34	NL	6
Ifrane	33.53	-5.11	MA	6
Kyōtanabe	34.80	135.77	JP	6
Bundaberg	-24.87	152.35	AU	6
Aku	6.71	7.32	NG	6
Huayuan	28.29	117.21	CN	6
Caçador	-26.78	-51.02	BR	6
Shibīn al Qanāţir	30.31	31.32	EG	6
Goianésia	-15.32	-49.12	BR	6
Lanxi	29.22	119.47	CN	6
Oudtshoorn	-33.60	22.20	ZA	6
Drohobych	49.35	23.51	UA	6
Detmold	51.94	8.87	DE	6
Bawāna	28.80	77.03	IN	6
Al Buraymī	24.25	55.79	OM	6
Kasama	36.38	140.27	JP	6
Genhe	50.78	121.52	CN	6
Gresik	-7.15	112.66	ID	6
Birobidzhan	48.79	132.92	RU	6
Oyan	8.05	4.77	NG	6
Shāhābād	27.64	79.94	IN	6
Walvis Bay	-22.96	14.51	NA	6
Don Carlos	7.68	125.00	PH	6
Sewon	-7.88	110.36	ID	6
Virudhachalam	11.51	79.33	IN	6
Luocheng	29.38	104.03	CN	6
Kabanjahe	3.10	98.49	ID	6
Rapid City	44.08	-103.23	US	6
Necochea	-38.55	-58.74	AR	6
Chāndpur	29.13	78.27	IN	6
Cao Bằng	22.67	106.26	VN	6
Pirassununga	-22.00	-47.43	BR	6
Târgu Jiu	45.05	23.28	RO	6
Bat Khela	34.62	71.97	PK	6
Jega	12.22	4.38	NG	6
Warner Robins	32.62	-83.63	US	6
Heguan	36.89	118.57	CN	6
Solok	-0.80	100.66	ID	6
Kāsipālaiyam	11.32	77.71	IN	6
Rochester Hills	42.66	-83.15	US	6
Viana	-20.39	-40.50	BR	6
Chibuto	-24.69	33.53	MZ	6
Sikandarābād	28.45	77.70	IN	6
Asaba	6.20	6.73	NG	6
Chilca	-12.09	-75.21	PE	6
Ohafia-Ifigh	5.61	7.81	NG	6
Juegang	32.32	121.19	CN	6
Virudunagar	9.59	77.96	IN	6
Bonao	18.94	-70.41	DO	6
Khlong San	13.73	100.51	TH	6
Yoshikawa	35.89	139.84	JP	6
Belek	36.86	31.07	TR	6
Decatur	39.84	-88.95	US	6
Kadiyivka	48.57	38.64	UA	6
Tatvan	38.49	42.28	TR	6
General Roca	-39.03	-67.58	AR	6
Kawit	14.44	120.90	PH	6
Fada N'gourma	12.06	0.36	BF	6
Peterhof	59.88	29.90	RU	6
Shostka	51.86	33.47	UA	6
Pierrefonds-Roxboro	45.50	-73.84	CA	6
Taman Senai	1.60	103.64	MY	6
Dazaifu	33.51	130.52	JP	6
Southfield	42.47	-83.22	US	6
Richard-Toll	16.46	-15.70	SN	6
Pattukkottai	10.42	79.32	IN	6
Siemianowice Śląskie	50.33	19.03	PL	6
Negēlē	5.32	39.58	ET	6
Mayagüez	18.20	-67.14	PR	6
Néa Smýrni	37.95	23.71	GR	6
Castro	-24.79	-50.01	BR	6
Ţāmiyah	29.48	30.96	EG	6
Joypur Hāt	25.10	89.03	BD	6
Ishioka	36.18	140.27	JP	6
Majalengka	-6.84	108.23	ID	6
Pusad	19.91	77.58	IN	6
Berdychiv	49.89	28.58	UA	6
Sihanoukville	10.61	103.53	KH	6
Ratchathewi	13.76	100.53	TH	6
Santa Isabel do Pará	-1.30	-48.16	BR	6
Jatibarang	-6.47	108.32	ID	6
Beled Hawo	3.93	41.88	SO	6
Shixing	24.95	114.07	CN	6
Koch'ang	35.43	126.70	KR	6
Rubí	41.49	2.03	ES	6
Zlín	49.23	17.67	CZ	6
Jurong East	1.33	103.74	SG	6
Dongdu	35.85	117.70	CN	6
Balanga	14.68	120.54	PH	6
San Juan de la Maguana	18.81	-71.23	DO	6
Bayreuth	49.95	11.58	DE	6
Oyem	1.60	11.58	GA	6
Russas	-4.94	-37.98	BR	6
Rābigh	22.80	39.03	SA	6
Lappeenranta	61.06	28.19	FI	6
Ostrów Wielkopolski	51.66	17.81	PL	6
Saint George	37.10	-113.58	US	6
Padre Las Casas	-38.76	-72.60	CL	6
Rosh Ha‘Ayin	32.10	34.96	IL	6
Caserta	41.07	14.33	IT	6
Yanjia	29.83	107.00	CN	6
Bethal	-26.46	29.47	ZA	6
Krathum Baen	13.65	100.26	TH	6
Nanyuki	0.01	37.07	KE	6
New Britain	41.66	-72.78	US	6
Tindivanam	12.23	79.66	IN	6
Dongkan	34.00	119.83	CN	6
Chopda	21.25	75.30	IN	6
Minusinsk	53.70	91.71	RU	6
Paine	-33.81	-70.74	CL	6
Almelo	52.36	6.66	NL	6
Thaba Nchu	-29.21	26.84	ZA	6
Selva Alegre	-16.37	-71.53	PE	6
Barra do Garças	-15.89	-52.26	BR	6
Hương Trà	16.53	107.48	VN	6
Huangchuan	32.14	115.04	CN	6
Georgiyevsk	44.15	43.47	RU	6
Daytona Beach	29.21	-81.02	US	6
Yelabuga	55.76	52.04	RU	6
Franklin	35.93	-86.87	US	6
Naro-Fominsk	55.39	36.73	RU	6
Sitrah	26.15	50.62	BH	6
Rio do Sul	-27.21	-49.64	BR	6
Wusu	44.43	84.68	CN	6
Gaspar	-26.93	-48.96	BR	6
Talā	30.68	30.94	EG	6
Guamúchil	25.46	-108.08	MX	6
Tailândia	-2.95	-48.95	BR	6
Miyang	24.40	103.44	CN	6
Ferkessédougou	9.59	-5.19	CI	6
Taliparamba	12.04	75.36	IN	6
Hekinan	34.88	136.98	JP	6
Jiangzhuang	36.49	119.79	CN	6
Beichengqu	40.44	113.15	CN	6
Gongju	36.46	127.12	KR	6
Alegrete	-29.78	-55.79	BR	6
Arua	3.02	30.91	UG	6
Candeias	-12.67	-38.55	BR	6
Socopó	8.23	-70.82	VE	6
Sangāreddi	17.62	78.09	IN	6
Shumen	43.27	26.92	BG	6
Venado Tuerto	-33.75	-61.97	AR	6
Pālghar	19.70	72.77	IN	6
Maroúsi	38.05	23.80	GR	6
Kalima	-5.49	28.22	CD	6
Bangkok Yai	13.72	100.48	TH	6
Xinzhi	36.50	111.70	CN	6
Turlock	37.49	-120.85	US	6
Dharapuram	10.74	77.53	IN	6
Tabatinga	-4.23	-69.94	BR	6
Abancay	-13.63	-72.88	PE	6
Temple	31.10	-97.34	US	6
Sobradinho	-15.65	-47.79	BR	6
Adelaide Hills	-34.91	138.71	AU	6
Guanajuato	21.02	-101.26	MX	6
Suva Reka	42.36	20.82	XK	6
Radès	36.77	10.27	TN	6
K’olīto	7.32	38.08	ET	6
Chiryū	35.00	137.03	JP	6
Ash Shafā	21.07	40.32	SA	6
Apple Valley	34.50	-117.19	US	6
Sagay	10.94	123.42	PH	6
Santo Antônio do Descoberto	-15.94	-48.26	BR	6
Sarnia	42.98	-82.40	CA	6
Kyosai	34.85	128.59	KR	6
Mysłowice	50.21	19.17	PL	6
Payyanur	12.09	75.20	IN	6
Ōtawara	36.87	140.03	JP	6
Casa Nova	-9.17	-40.98	BR	6
Nizwá	22.93	57.53	OM	6
Zhoucheng	35.91	116.31	CN	6
Sault Ste. Marie	46.52	-84.33	CA	6
Sakrand	26.14	68.27	PK	6
Itapira	-22.44	-46.82	BR	6
Thị Trấn Mạo Khê	21.06	106.59	VN	6
Mariano Roque Alonso	-25.21	-57.53	PY	6
Larnaca	34.92	33.63	CY	6
Purley	51.34	-0.11	GB	6
Bandar Saujana Utama	3.21	101.48	MY	6
Al Līth	20.15	40.27	SA	6
Lynwood	33.93	-118.21	US	6
La Paz	15.44	120.73	PH	6
Waukesha	43.01	-88.23	US	6
Le Bardo	36.81	10.13	TN	6
Gouda	52.02	4.71	NL	6
Sheopur	25.66	76.70	IN	6
Channapatna	12.65	77.21	IN	6
Bothaville	-27.39	26.62	ZA	6
Araranguá	-28.94	-49.50	BR	6
Goianira	-16.50	-49.43	BR	6
Antalaha	-14.90	50.28	MG	6
Caidian	30.58	114.03	CN	6
Busia	0.46	34.11	KE	6
Guildford	51.24	-0.57	GB	6
Koyilandy	11.44	75.69	IN	6
Mbouda	5.63	10.25	CM	6
Afikpo	5.89	7.94	NG	6
Landshut	48.53	12.16	DE	6
Santa Lucía	27.91	-15.54	ES	6
Gulfport	30.37	-89.09	US	6
Panzos	15.40	-89.64	GT	6
Sunzha	43.32	45.05	RU	6
Amatitlán	14.48	-90.63	GT	6
Jaboticabal	-21.25	-48.32	BR	6
Saint John	45.27	-66.06	CA	6
São Sebastião do Paraíso	-20.92	-46.99	BR	6
Farīdpur	28.21	79.54	IN	6
Tando Jam	25.43	68.53	PK	6
Yüksekova	37.57	44.29	TR	6
Birkhadem	36.71	3.05	DZ	6
Zaandam	52.44	4.83	NL	6
Borås	57.72	12.94	SE	6
Shakhtarsk	48.06	38.44	UA	6
Mānikganj	23.86	90.01	BD	6
Esbjerg	55.47	8.45	DK	6
Bouar	5.93	15.60	CF	6
Rolândia	-23.31	-51.37	BR	6
Migori	-1.06	34.47	KE	6
Barauni	25.47	85.98	IN	6
Yawata	34.87	135.70	JP	6
Apomu	7.35	4.18	NG	6
Minami-Alps	35.62	138.46	JP	6
Xiuyan	40.29	123.27	CN	6
Dārayyā	33.46	36.23	SY	6
Delgado	13.72	-89.17	SV	6
Pawtucket	41.88	-71.38	US	6
Chernogorsk	53.83	91.31	RU	6
Lauderhill	26.14	-80.21	US	6
Indaial	-26.90	-49.23	BR	6
Rock Hill	34.92	-81.03	US	6
Khanabad	36.68	69.11	AF	6
Sragen	-7.43	111.02	ID	6
Luohuang	29.35	106.44	CN	6
Madīnat as Sādāt	30.37	30.51	EG	6
Tākestān	36.07	49.70	IR	6
Dias d'Ávila	-12.61	-38.30	BR	6
Fuengirola	36.54	-4.62	ES	6
Solana	17.65	121.69	PH	6
Shangsi	22.16	107.98	CN	6
Fiditi	7.71	3.92	NG	6
Silver Spring	38.99	-77.03	US	6
Barnsley	53.55	-1.48	GB	6
Qarasu	44.20	80.42	CN	6
Tokmok	42.84	75.30	KG	6
Yumbo	3.58	-76.49	CO	6
Borongan	11.61	125.43	PH	6
Yukuhashi	33.73	130.98	JP	6
Medenine	33.35	10.51	TN	6
Triyuga	26.79	86.70	NP	6
Shahrixon	40.71	72.06	UZ	6
Campo Formoso	-10.51	-40.32	BR	6
Oroquieta	8.49	123.80	PH	6
Upington	-28.45	21.26	ZA	6
Trujillo	9.37	-70.44	VE	6
Don Torcuato	-34.49	-58.63	AR	6
Zelenogorsk	56.11	94.59	RU	6
West Gulfport	30.40	-89.09	US	6
Lowestoft	52.48	1.75	GB	6
Krishnagiri	12.52	78.21	IN	6
Parys	-26.90	27.46	ZA	6
Agios Dimitrios	37.93	23.73	GR	6
Sopur	34.29	74.47	IN	6
Yalova	40.66	29.28	TR	6
Winneba	5.35	-0.62	GH	6
Szolnok	47.18	20.20	HU	6
Changtu	42.78	124.10	CN	6
Ban Ko Sire	7.89	98.43	TH	6
Växjö	56.88	14.81	SE	6
Huashan	34.63	116.74	CN	6
Ilidža	43.83	18.31	BA	6
Lüneburg	53.25	10.42	DE	6
Tôlanaro	-25.03	46.98	MG	6
El Pueblito	20.54	-100.44	MX	6
Flower Mound	33.01	-97.10	US	6
Stargard	53.34	15.05	PL	6
Cremona	45.13	10.02	IT	6
Rāyagada	19.17	83.41	IN	6
Serendah	3.36	101.60	MY	6
Anlu	31.26	113.68	CN	6
Guasave	25.57	-108.47	MX	6
Fernandópolis	-20.28	-50.25	BR	6
Yilan	46.32	129.56	CN	6
Zahirābād	17.68	77.61	IN	6
Sur	22.57	59.53	OM	6
Linjiang	31.10	108.22	CN	6
Carpi	44.78	10.88	IT	6
Khopoli	18.79	73.35	IN	6
San Francisco del Rincón	21.02	-101.86	MX	6
Centreville	38.84	-77.43	US	6
Ratangarh	28.08	74.62	IN	6
Moanda	-1.57	13.20	GA	6
Thākurgaon	26.03	88.47	BD	6
Hala	25.81	68.42	PK	6
Mārkāpur	15.74	79.27	IN	6
Passaic	40.86	-74.13	US	6
Guiping	23.39	110.07	CN	6
Gemlik	40.43	29.16	TR	6
Tenri	34.58	135.83	JP	6
Riverview	27.87	-82.33	US	6
Sougueur	35.19	1.50	DZ	6
Redlands	34.06	-117.18	US	6
Orita-Eruwa	7.56	3.44	NG	6
Zográfos	37.98	23.77	GR	6
Missoula	46.87	-113.99	US	6
Rancho Cordova	38.59	-121.30	US	6
Farshūţ	26.06	32.16	EG	6
Celle	52.62	10.08	DE	6
Bolpur	23.66	87.70	IN	6
Panjim	15.50	73.83	IN	6
Rānāghāt	23.18	88.57	IN	6
Pacajus	-4.17	-38.46	BR	6
Horizonte	-4.10	-38.49	BR	6
Tanabe	33.73	135.37	JP	6
Doba	8.66	16.85	TD	6
Hongwŏn	40.03	127.96	KP	6
Aubervilliers	48.92	2.38	FR	6
Al Ghanāyim	26.88	31.33	EG	6
Kuandian	40.73	124.78	CN	6
Gwadar	25.12	62.33	PK	6
Musashimurayama	35.74	139.43	JP	6
Shenzhen City Centre	22.54	114.08	CN	6
Vila Nova de Gaia	41.12	-8.61	PT	6
Aïn Temouchent	35.30	-1.14	DZ	6
Uwajima	33.22	132.56	JP	6
Ejura	7.39	-1.36	GH	6
Poyang	28.99	116.67	CN	6
Yongfeng	27.45	112.17	CN	6
Lahraouyine	33.54	-7.53	MA	6
Kopeysk	55.12	61.62	RU	6
Eha Amufu	6.66	7.76	NG	6
Fatehābād	29.52	75.46	IN	6
Bāpatla	15.90	80.47	IN	6
Södertälje	59.20	17.63	SE	6
Gongchangling	41.12	123.45	CN	6
Beypore	11.17	75.81	IN	6
Bir el Ater	34.74	8.06	DZ	6
Jimo	36.39	120.46	CN	6
Malumfashi	11.79	7.62	NG	6
Cổ Đô	21.28	105.36	VN	6
Janaúba	-15.80	-43.31	BR	6
Koppal	15.35	76.15	IN	6
Buenavista	8.98	125.41	PH	6
Al Qanāyāt	30.62	31.46	EG	6
Pala	9.36	14.91	TD	6
Tongyeong	34.85	128.43	KR	6
Badvel	14.75	79.06	IN	6
Antanifotsy	-19.65	47.32	MG	6
Dialakorodji	12.70	-7.96	ML	6
Sherwood Park	53.52	-113.32	CA	6
Dādri	28.55	77.55	IN	6
Chingford	51.63	0.00	GB	6
Samar	48.63	35.26	UA	6
Thenkasi	8.96	77.32	IN	6
New Braunfels	29.70	-98.12	US	6
Pabianice	51.66	19.35	PL	6
Altamura	40.83	16.55	IT	6
Berekum	7.45	-2.58	GH	6
Suratgarh	29.32	73.90	IN	6
Santa María Chimalhuacán	19.42	-98.95	MX	6
Mariano	8.83	125.12	PH	6
Brumado	-14.20	-41.67	BR	6
Auraiya	26.47	79.51	IN	6
Lamezia Terme	38.96	16.31	IT	6
Vol’sk	52.04	47.38	RU	6
Bailundo	-9.57	15.99	AO	6
Halmstad	56.67	12.86	SE	6
Cherry Hill	39.93	-75.03	US	6
Baiquan	47.61	126.08	CN	6
Beloretsk	53.96	58.40	RU	6
Palani	10.45	77.52	IN	6
Benidorm	38.54	-0.13	ES	6
Contramaestre	20.30	-76.24	CU	6
Nabeul	36.46	10.74	TN	6
Ishimbay	53.45	56.04	RU	6
Alamata	12.42	39.56	ET	6
Capanema	-1.20	-47.18	BR	6
Pagar Alam	-4.03	103.25	ID	6
Grande Prairie	55.17	-118.80	CA	6
Linares	24.86	-99.57	MX	6
Bayramaly	37.62	62.17	TM	6
Jiangyan	32.51	120.14	CN	6
Maidenhead	51.52	-0.72	GB	6
Shiguai	40.71	110.29	CN	6
Faro	37.02	-7.93	PT	6
Maebaru-chūō	33.56	130.20	JP	6
Eniwa	42.89	141.58	JP	6
Flagstaff	35.20	-111.65	US	6
Rittō	35.03	136.00	JP	6
Chivacoa	10.16	-68.89	VE	6
Farroupilha	-29.23	-51.35	BR	6
Anan	33.92	134.65	JP	6
Martil	35.62	-5.28	MA	6
Danao	10.52	124.03	PH	6
Gniezno	52.53	17.58	PL	6
Alphen aan den Rijn	52.13	4.66	NL	6
Kadirli	37.37	36.10	TR	6
Goya	-29.14	-59.26	AR	6
Châu Đốc	10.70	105.12	VN	6
Phaya Thai	13.78	100.54	TH	6
Dārāb	28.75	54.54	IR	6
Şirvan	39.94	48.93	AZ	6
Schweizer-Reneke	-27.19	25.33	ZA	6
Adler	43.43	39.92	RU	6
Dimbokro	6.65	-4.71	CI	6
Faranah	10.04	-10.74	GN	6
Haining	30.54	120.69	CN	6
Doğubayazıt	39.55	44.08	TR	6
Alcalá de Guadaira	37.34	-5.84	ES	6
Shankou	21.60	109.72	CN	6
Chapayevsk	52.98	49.71	RU	6
Stafford	52.81	-2.12	GB	6
Mauban	14.19	121.73	PH	6
Tsurugashima	35.96	139.40	JP	6
Nallūr	11.10	77.39	IN	6
Taungdwingyi	20.01	95.55	MM	6
Inaruwa	26.61	87.15	NP	6
Indang	14.20	120.88	PH	6
Muncie	40.19	-85.39	US	6
Mineiros	-17.57	-52.55	BR	6
Pan’an	34.75	105.11	CN	6
Cahama	-16.29	14.31	AO	6
Bamberg	49.90	10.90	DE	6
Khāliş	33.81	44.53	IQ	6
Ayvalık	39.32	26.69	TR	6
Uxbridge	51.55	-0.48	GB	6
Baikonur	45.62	63.32	KZ	6
Rabwah	31.76	72.91	PK	6
Fordon	53.15	18.17	PL	6
Vikindu	-7.01	39.30	TZ	6
Raha	-4.84	122.72	ID	6
Duyên Hải	9.63	106.49	VN	6
Weston	26.10	-80.40	US	6
Imola	44.36	11.71	IT	6
Aigáleo	37.98	23.68	GR	6
Izmayil	45.35	28.84	UA	6
Mengcheng Chengguanzhen	33.27	116.57	CN	6
San Joaquín	10.26	-67.79	VE	6
Abhar	36.15	49.22	IR	6
Xinhe	36.92	119.59	CN	6
Moquegua	-17.20	-70.94	PE	6
Shima	28.99	105.92	CN	6
Güira de Melena	22.80	-82.51	CU	6
Chamrajnagar	11.92	76.94	IN	6
Mertoyudan	-7.52	110.23	ID	6
Votuporanga	-20.42	-49.97	BR	6
Consolación del Sur	22.51	-83.51	CU	6
Mīthepur	28.50	77.32	IN	6
Vaasa	63.10	21.62	FI	6
Segamat	2.51	102.82	MY	6
Rājbirāj	26.54	86.75	NP	6
Ciro	7.83	38.23	ET	6
Mérignac	44.84	-0.65	FR	6
Bondowoso	-7.91	113.82	ID	6
Satpayev	47.90	67.54	KZ	6
Santa Cruz de Mara	10.79	-71.69	VE	6
Māngrol	21.12	70.11	IN	6
Kahror Pakka	29.62	71.91	PK	6
Kaura Namoda	12.59	6.59	NG	6
Basavakalyan	17.87	76.95	IN	6
Planeta Rica	8.41	-75.59	CO	6
Āsosa	10.07	34.53	ET	6
Las Piedras	-34.73	-56.22	UY	6
Kladno	50.15	14.10	CZ	6
Pul Pehlad	28.50	77.29	IN	6
Tacarigua	10.09	-67.92	VE	6
Abū ‘Arīsh	16.97	42.83	SA	6
Khāsh	28.22	61.22	IR	6
Fengping	24.40	98.52	CN	6
Brossard	45.45	-73.47	CA	6
Chāībāsa	22.55	85.80	IN	6
Dougnane	14.96	-16.87	SN	6
Tournai	50.61	3.39	BE	6
Yokota	35.75	139.38	JP	6
Linares	-35.85	-71.59	CL	6
Rhondda	51.66	-3.45	GB	6
Karonga	-9.93	33.93	MW	6
Frederick	39.41	-77.41	US	6
Fuefuki	35.64	138.64	JP	6
Frontera	26.93	-101.45	MX	6
Minamiarupusu	35.61	138.46	JP	6
Villa Carlos Paz	-31.42	-64.49	AR	6
Pasco	46.24	-119.10	US	6
Mobārakeh	32.35	51.50	IR	6
Thanlyin	16.77	96.25	MM	6
Dobrich	43.56	27.83	BG	6
Chengxian Chengguanzhen	33.75	105.73	CN	6
Pittsburg	38.03	-121.88	US	6
Luquembo	-10.74	17.72	AO	6
Núi Thành	15.43	108.66	VN	6
Sayyān	15.17	44.32	YE	6
Tripunittura	9.94	76.33	IN	6
Alenquer	-1.94	-54.74	BR	6
Bongabon	15.63	121.14	PH	6
Gujar Khan	33.25	73.30	PK	6
Xininglu	44.34	84.90	CN	6
Chuhar Kana	31.75	73.80	PK	6
Palatine	42.11	-88.03	US	6
Kampung Baru Balakong	3.03	101.75	MY	6
Toyoake	35.04	137.00	JP	6
Bitola	41.03	21.34	MK	6
Ambovombe	-25.18	46.09	MG	6
Shājāpur	23.43	76.28	IN	6
Anseong	37.01	127.27	KR	6
Xuantan	29.21	105.57	CN	6
Jiehu	35.54	118.45	CN	6
Bargny	14.70	-17.23	SN	6
Ōdate	40.27	140.56	JP	6
Suwałki	54.11	22.93	PL	6
Mettupalayam	11.30	76.93	IN	6
North Richland Hills	32.83	-97.23	US	6
San Leonardo	15.36	120.96	PH	6
Kissimmee	28.30	-81.42	US	6
Hunedoara	45.75	22.90	RO	6
Sunām	30.13	75.80	IN	6
Bhawānipatna	19.91	83.17	IN	6
Sōja	34.68	133.75	JP	6
Mindelo	16.89	-24.98	CV	6
Ostend	51.22	2.93	BE	6
Nganjuk	-7.61	111.90	ID	6
Sint-Niklaas	51.17	4.14	BE	6
Calauag	13.96	122.29	PH	6
Xiaoshi	41.30	124.12	CN	6
Ziauddin Pur	28.71	77.28	IN	6
Boconó	9.25	-70.25	VE	6
Magalang	15.22	120.66	PH	6
Ihnāsyā al Madīnah	29.09	30.94	EG	6
Jamkhandi	16.50	75.29	IN	6
Bogale	16.29	95.40	MM	6
Güines	22.84	-82.03	CU	6
Royal Tunbridge Wells	51.13	0.26	GB	6
Walnut Creek	37.91	-122.06	US	6
Ad Dilinjāt	30.83	30.54	EG	6
Koson	39.04	65.58	UZ	6
Cantaura	9.31	-64.36	VE	6
Granada	3.55	-73.71	CO	6
Inongo	-1.93	18.29	CD	6
Hoorn	52.64	5.06	NL	6
Basmat	19.33	77.16	IN	6
Libon	13.30	123.44	PH	6
Assen	53.00	6.56	NL	6
Chulucanas	-5.09	-80.16	PE	6
Tuymazy	54.61	53.71	RU	6
Taj Pul	28.49	77.31	IN	6
Enugu-Ukwu	6.17	7.01	NG	6
Cordova	35.16	-89.78	US	6
Moriya	35.93	140.00	JP	6
Itō	34.97	139.08	JP	6
Yachimata	35.65	140.32	JP	6
Venâncio Aires	-29.61	-52.19	BR	6
Ponferrada	42.55	-6.60	ES	6
Lupon	6.90	126.01	PH	6
Gion	34.43	132.47	JP	6
Idah	7.11	6.74	NG	6
Yunmen	30.08	106.32	CN	6
Lys’va	58.11	57.81	RU	6
Knysna	-34.04	23.05	ZA	6
Kayamkulam	9.18	76.50	IN	6
Mount Vernon	40.91	-73.84	US	6
Darya Khan	31.78	71.10	PK	6
Dharmapuri	12.13	78.16	IN	6
Heishan	41.69	122.11	CN	6
Conroe	30.31	-95.46	US	6
Borisoglebsk	51.37	42.10	RU	6
Obonoma	4.71	6.79	NG	6
Dothan	31.22	-85.39	US	6
Sosnovyy Bor	59.90	29.09	RU	6
Feodosiya	45.03	35.38	UA	6
Porto Nacional	-10.71	-48.42	BR	6
Aschaffenburg	49.98	9.15	DE	6
Bouïra	36.37	3.90	DZ	6
Chinchiná	4.98	-75.60	CO	6
Tsuruga	35.65	136.06	JP	6
Hämeenlinna	61.00	24.46	FI	6
Waterloo	42.49	-92.34	US	6
Tanauan	14.09	121.15	PH	6
Pengcheng	36.43	114.17	CN	6
Wenjiang	28.39	104.56	CN	6
Al Balyanā	26.24	32.00	EG	6
Rivas-Vaciamadrid	40.33	-3.51	ES	6
Sheki	41.19	47.17	AZ	6
Nakivale Refugee Camp	-0.74	31.00	UG	6
Maple Grove	45.07	-93.46	US	6
Baranoa	10.79	-74.92	CO	6
Aparri	18.36	121.64	PH	6
Bīsalpur	28.29	79.80	IN	6
Peruíbe	-24.32	-47.00	BR	6
Mingguang	32.78	117.96	CN	6
Ninghai	29.29	121.42	CN	6
Framingham	42.28	-71.42	US	6
San Isidro	-12.10	-77.04	PE	6
Sabae	35.95	136.18	JP	6
Oriximiná	-1.77	-55.87	BR	6
Al Faḩāḩīl	29.08	48.13	KW	6
Saldanha	-33.01	17.94	ZA	6
Adrar	27.87	-0.29	DZ	6
Issia	6.49	-6.59	CI	6
Dolgoprudnyy	55.95	37.50	RU	6
Formiga	-20.46	-45.43	BR	6
Söke	37.75	27.41	TR	6
Altagracia de Orituco	9.86	-66.38	VE	6
Nghĩa Lộ	21.60	104.52	VN	6
Attili	16.70	81.60	IN	6
Ina	35.83	137.95	JP	6
Redondo Beach	33.85	-118.39	US	6
Corby	52.50	-0.69	GB	6
Aïn Harrouda	33.64	-7.45	MA	6
Langarūd	37.20	50.15	IR	6
Guiglo	6.54	-7.49	CI	6
Cadereyta Jiménez	25.59	-100.00	MX	6
Majadahonda	40.47	-3.87	ES	6
Bossier City	32.52	-93.73	US	6
Cumbum	9.74	77.28	IN	6
Morón	10.49	-68.20	VE	6
Neubrandenburg	53.56	13.26	DE	6
Artemisa	22.81	-82.76	CU	6
Valle de Santiago	20.39	-101.19	MX	6
Sanlúcar de Barrameda	36.78	-6.35	ES	6
Bir el Djir	35.72	-0.55	DZ	6
Bungoma	0.56	34.56	KE	6
Macenta	8.54	-9.47	GN	6
Amparo	-22.70	-46.76	BR	6
Munnar	10.09	77.06	IN	6
Balanbale	5.77	45.76	SO	6
Panipat Taraf Makhdum Zadgan	29.42	76.99	IN	6
Cadereyta	25.58	-99.98	MX	6
Bourges	47.08	2.40	FR	6
Yorba Linda	33.89	-117.81	US	6
Nābha	30.38	76.15	IN	6
Ardeşen	41.19	40.98	TR	6
Chaihe	44.76	129.68	CN	6
Budyonnovsk	44.78	44.17	RU	6
Bihāt	25.43	86.02	IN	6
Minggang	32.46	114.05	CN	6
Tangzhai	34.43	116.59	CN	6
Xunyang	32.82	109.37	CN	6
Barberton	-25.79	31.05	ZA	6
Samāstipur	25.86	85.78	IN	6
Calbayog City	12.07	124.60	PH	6
Belogorsk	50.91	128.51	RU	6
Hashima	35.33	136.68	JP	6
Kāranja	20.48	77.49	IN	6
Stróvolos	35.15	33.33	CY	6
Campiña	38.22	-2.98	ES	6
Yanghe	38.28	106.25	CN	6
Gode	5.95	43.55	ET	6
Concepción del Uruguay	-32.48	-58.23	AR	6
San Mateo Atenco	19.27	-99.53	MX	6
Angat	14.93	121.03	PH	6
Woodbury	44.92	-92.96	US	6
San Fernando	-8.40	-74.54	PE	6
Tanjung Selor	2.84	117.37	ID	6
Conceição do Coité	-11.56	-39.28	BR	6
Dongfeng	42.67	125.53	CN	6
Roman	46.92	26.93	RO	6
Sītāmarhi	26.59	85.49	IN	6
Bârlad	46.23	27.67	RO	6
Blagoevgrad	42.01	23.10	BG	6
Deva	45.88	22.90	RO	6
Kamuli	0.95	33.12	UG	6
Xo‘jayli Shahri	42.41	59.45	UZ	6
Rājsamand	25.07	73.88	IN	6
Kaga	36.30	136.33	JP	6
Tamano	34.52	133.95	JP	6
Quillota	-32.88	-71.25	CL	6
Eau Claire	44.81	-91.50	US	6
Jiang’an	28.73	105.07	CN	6
Saraburi	14.53	100.92	TH	6
Ishim	56.11	69.49	RU	6
Zhenlai	45.85	123.20	CN	6
Velsen-Zuid	52.46	4.65	NL	6
Waldorf	38.62	-76.94	US	6
Dessau	51.84	12.25	DE	6
Malkāpur	20.89	76.20	IN	6
La Carlota	10.42	122.92	PH	6
Santo Domingo Tehuantepec	16.32	-95.24	MX	6
Shuangfengqiao	29.72	106.63	CN	6
Apac	1.98	32.54	UG	6
Dāmghān	36.17	54.34	IR	6
Mococa	-21.47	-47.00	BR	6
Hwadae	40.84	129.50	KP	6
Songjianghe	42.19	127.48	CN	6
Ede	52.03	5.66	NL	6
Davis	38.54	-121.74	US	6
Subic	14.88	120.23	PH	6
Şırnak	37.51	42.45	TR	6
Tsushima	35.17	136.72	JP	6
Yan Besar	5.80	100.37	MY	6
Pālang	23.22	90.35	BD	6
Modāsa	23.46	73.30	IN	6
Glen Burnie	39.16	-76.62	US	6
Banepā	27.63	85.52	NP	6
Agbor	6.25	6.19	NG	6
Camarillo	34.22	-119.04	US	6
Jaisalmer	26.92	70.90	IN	6
Xaçmaz	41.46	48.81	AZ	6
Luorong	24.41	109.61	CN	6
Tomé-Açu	-2.42	-48.15	BR	6
Kovel	51.22	24.70	UA	6
Victoria	28.81	-97.00	US	6
Trapani	38.02	12.54	IT	6
Paignton	50.44	-3.57	GB	6
Rosales	15.89	120.63	PH	6
Lüeyang Chengguanzhen	33.33	106.15	CN	6
Tejen	37.38	60.51	TM	6
Gaithersburg	39.14	-77.20	US	6
Babati	-4.22	35.75	TZ	6
Shorkot	31.91	70.88	PK	6
Wenling	28.38	121.38	CN	6
Chaguanas	10.52	-61.42	TT	6
Buldāna	20.53	76.18	IN	6
Montemorelos	25.19	-99.83	MX	6
Omīdīyeh	30.76	49.70	IR	6
Liepāja	56.50	21.01	LV	6
Huajing	31.12	121.45	CN	6
Dhenkānāl	20.66	85.60	IN	6
Ezza-Ohu	6.44	8.08	NG	6
Ixtapa-Zihuatanejo	17.64	-101.55	MX	6
Rossendale	53.68	-2.28	GB	6
Fuqing	25.73	119.37	CN	6
Urun-Islāmpur	17.05	74.27	IN	6
Caohe	30.23	115.43	CN	6
Eskilstuna	59.37	16.51	SE	6
Kiyosu	35.22	136.83	JP	6
Kostyantynivka	48.53	37.71	UA	6
Gaoliu	36.80	118.50	CN	6
Gopālganj	26.47	84.44	IN	6
City of Isabela	6.70	121.97	PH	6
Bongaigaon	26.48	90.56	IN	6
Zadar	44.12	15.23	HR	6
Sangamner	19.57	74.21	IN	6
San Luis	20.19	-75.85	CU	6
Caicara del Orinoco	7.64	-66.17	VE	6
Pingzhuang	42.04	119.29	CN	6
South San Francisco	37.65	-122.41	US	6
Sousa	-6.76	-38.23	BR	6
Kstovo	56.15	44.20	RU	6
Shiojiri	36.10	137.97	JP	6
Lippstadt	51.67	8.34	DE	6
Oum el Bouaghi	35.88	7.11	DZ	6
Tomaszów Mazowiecki	51.53	20.01	PL	6
Tianliu	37.00	118.78	CN	6
Minchinabad	30.16	73.57	PK	6
Lushar	36.48	101.56	CN	6
Ödemiş	38.23	27.97	TR	6
Wanggou	34.67	116.49	CN	6
Fengkou	30.08	113.33	CN	6
Néa Ionía	38.04	23.76	GR	6
Iranduba	-3.28	-60.19	BR	6
Hāveri	14.79	75.40	IN	6
Dolores Hidalgo	21.16	-100.93	MX	6
Shajing Town	22.74	113.81	CN	6
Kenner	29.99	-90.24	US	6
Melati	-7.73	110.37	ID	6
Santa Cruz Xoxocotlán	17.03	-96.74	MX	6
Aalen	48.84	10.09	DE	6
Washington	54.90	-1.52	GB	6
Saint-Nazaire	47.28	-2.22	FR	6
Fukutsu	33.78	130.49	JP	6
Przemyśl	49.78	22.77	PL	6
Estepona	36.43	-5.15	ES	6
Nunukan	4.14	117.65	ID	6
Mannargudi	10.67	79.45	IN	6
Dinslaken	51.56	6.74	DE	6
Nizhyn	51.05	31.89	UA	6
Rockville	39.08	-77.15	US	6
Liuhe	42.28	125.75	CN	6
Embu-Guaçu	-23.83	-46.81	BR	6
Târgovişte	44.93	25.46	RO	6
Kashima-shi	35.97	140.64	JP	6
Abū al Maţāmīr	30.91	30.17	EG	6
Yuba City	39.14	-121.62	US	6
Hanyin Chengguanzhen	32.89	108.50	CN	6
Tataouine	32.93	10.45	TN	6
Jhālāwār	24.60	76.16	IN	6
Solna	59.36	18.00	SE	6
Aleksin	54.50	37.07	RU	6
Sidi Aïssa	35.89	3.77	DZ	6
Palo Alto	37.44	-122.14	US	6
Saiki	32.95	131.90	JP	6
Wacheng Neighborhood	33.78	114.52	CN	6
Seinäjoki	62.79	22.83	FI	6
Tarn Taran	31.45	74.93	IN	6
General Pico	-35.66	-63.76	AR	6
Neuwied	50.43	7.47	DE	6
Ferrol	43.48	-8.23	ES	6
Casas Adobes	32.32	-111.00	US	6
Bajos de Haina	18.42	-70.03	DO	6
Marysville	48.05	-122.18	US	6
Duoba	36.66	101.53	CN	6
Siddipet	18.10	78.85	IN	6
Unna	51.54	7.69	DE	6
Shaozhuang	36.75	118.32	CN	6
Dambulla	7.86	80.65	LK	6
Trang	7.56	99.61	TH	6
Baní	18.28	-70.33	DO	6
Sayhāt	26.48	50.05	SA	6
Tēpī	7.20	35.45	ET	6
Bakıxanov	40.42	49.97	AZ	6
Karlskrona	56.16	15.59	SE	6
Dinalupihan	14.88	120.45	PH	6
Bellampalli	19.06	79.49	IN	6
Focșani	45.70	27.18	RO	6
South Jordan	40.56	-111.93	US	6
Tailai	46.39	123.41	CN	6
Lishi	29.08	106.26	CN	6
Quartu Sant'Elena	39.23	9.25	IT	6
La Mohammedia	36.67	10.16	TN	6
Jidd Ḩafş	26.22	50.55	BH	6
Chengyang	35.58	118.83	CN	6
Sanchazi	42.08	126.60	CN	6
Fort McMurray	56.73	-111.38	CA	6
Kurihara	38.75	141.00	JP	6
Daxu	34.28	117.55	CN	6
Oshkosh	44.02	-88.54	US	6
Ramos Arizpe	25.54	-100.95	MX	6
Aflao	6.12	1.19	GH	6
Qaraqash	37.27	79.73	CN	6
Barbil	22.10	85.38	IN	6
Cabedelo	-6.98	-34.83	BR	6
Taihe	30.10	106.05	CN	6
Lençóis Paulista	-22.60	-48.80	BR	6
Koratla	18.82	78.71	IN	6
North Little Rock	34.77	-92.27	US	6
Lianyuan	27.69	111.66	CN	6
Goba	7.02	39.98	ET	6
Stalowa Wola	50.58	22.05	PL	6
Mansehra	34.33	73.20	PK	6
Sokaraja	-7.46	109.29	ID	6
Smila	49.23	31.88	UA	6
Folkestone	51.08	1.17	GB	6
Qipan	34.24	118.22	CN	6
Plauen	50.50	12.14	DE	6
Napier	-39.49	176.91	NZ	6
San Antonio del Táchira	7.81	-72.44	VE	6
Rishīkesh	30.11	78.29	IN	6
Kungur	57.41	56.97	RU	6
Kituku	-7.58	30.21	CD	6
Castelldefels	41.28	1.97	ES	6
Goyerkāta	26.70	89.03	IN	6
Klintsy	52.76	32.24	RU	6
Tōgane	35.55	140.37	JP	6
Tangxiang	29.70	105.72	CN	6
Neryungri	56.66	124.72	RU	6
Huinan	42.62	126.26	CN	6
Bayonne	40.67	-74.11	US	6
Hounslow	51.47	-0.36	GB	6
Besbes	36.70	7.85	DZ	6
Eagan	44.80	-93.17	US	6
Beimeng	36.60	119.50	CN	6
Leninogorsk	54.60	52.45	RU	6
Cataguases	-21.39	-42.70	BR	6
Bergen op Zoom	51.49	4.29	NL	6
Delray Beach	26.46	-80.07	US	6
Algueirão	38.80	-9.34	PT	6
Loures	38.83	-9.17	PT	6
Rajin	42.26	130.28	KP	6
Granby	45.40	-72.73	CA	6
Marondera	-18.19	31.55	ZW	6
Gama	-8.57	13.48	AO	6
Mandamarri	18.97	79.47	IN	6
Jesus Maria	-12.07	-77.04	PE	6
Muling	44.92	130.52	CN	6
Viladecans	41.31	2.01	ES	6
Castellammare di Stabia	40.70	14.49	IT	6
Cheria	35.27	7.75	DZ	6
Kasungu	-13.03	33.48	MW	6
Huanren	41.26	125.37	CN	6
Qionghu	28.84	112.36	CN	6
I‘zāz	36.59	37.05	SY	6
Thái Hòa	18.92	104.97	VN	6
Camucuio	-14.11	13.24	AO	6
Gamping Lor	-7.80	110.33	ID	6
Nikki	9.94	3.21	BJ	6
Tanjong Malim	3.68	101.52	MY	6
Oued Lill	36.83	10.04	TN	6
Beruniy	41.69	60.75	UZ	6
Huanan	46.24	130.55	CN	6
Tissemsilt	35.61	1.81	DZ	6
Wamena	-4.10	138.95	ID	6
Gukovo	48.05	39.93	RU	6
Sagunto	39.68	-0.27	ES	6
Morón	22.11	-78.63	CU	6
Puliyankudi	9.17	77.40	IN	6
Zamość	50.72	23.25	PL	6
Xiaolingwei	32.03	118.85	CN	6
Ambilobe	-13.20	49.05	MG	6
Johnson City	36.31	-82.35	US	6
Kitamoto	36.03	139.54	JP	6
Gwa	17.59	94.58	MM	6
Ţurayf	31.67	38.66	SA	6
Calapan	13.41	121.18	PH	6
Johor Jaya	1.54	103.81	MY	6
Kherson	46.64	32.61	UA	6
Ganshui	28.74	106.71	CN	6
Dale City	38.64	-77.31	US	6
Namyang-nodongjagu	42.95	129.86	KP	6
Silvan	38.14	41.01	TR	6
Lesosibirsk	58.24	92.48	RU	6
Cedar Park	30.51	-97.82	US	6
Jablah	35.36	35.93	SY	6
Niitsu-honchō	37.80	139.12	JP	6
Lahat	-3.79	103.54	ID	6
Rotorua	-38.14	176.25	NZ	6
Duramē	7.23	37.88	ET	6
Itapetinga	-15.25	-40.25	BR	6
Yaoji	34.07	117.82	CN	6
Qiantang	30.18	106.32	CN	6
Vilanova i la Geltrú	41.22	1.73	ES	6
Mengyin	35.71	117.93	CN	6
Palín	14.40	-90.70	GT	6
Lichtenburg	-26.15	26.16	ZA	6
Tatabánya	47.59	18.38	HU	6
Jietou	25.43	98.65	CN	6
Saint Cloud	45.56	-94.16	US	6
Ellicott City	39.27	-76.80	US	6
Palāsa	18.77	84.41	IN	6
Bayiji	34.27	117.68	CN	6
Finchley	51.60	-0.20	GB	6
Laguna Niguel	33.52	-117.71	US	6
Polewali	-3.43	119.34	ID	6
Chegutu	-18.13	30.14	ZW	6
Myŏngch’ŏn	41.07	129.43	KP	6
Saint Charles	38.78	-90.48	US	6
Harlingen	26.19	-97.70	US	6
Shangkou	36.97	118.88	CN	6
Polevskoy	56.44	60.19	RU	6
Pavia	45.19	9.16	IT	6
Maués	-3.38	-57.72	BR	6
Ligezhuang	36.36	120.14	CN	6
Mitoyo	34.21	133.67	JP	6
Gohāna	29.14	76.70	IN	6
Pulivendla	14.42	78.23	IN	6
Từ Sơn	21.10	105.97	VN	6
Wrexham	53.05	-2.99	GB	6
Quwaysinā	30.56	31.16	EG	6
Chengalpattu	12.69	79.98	IN	6
Dashitou	43.31	128.51	CN	6
Rovaniemi	66.50	25.69	FI	6
San Ildefonso	15.08	120.94	PH	6
San Miguel	15.14	120.98	PH	6
Huanghua	35.89	119.46	CN	6
Kędzierzyn-Koźle	50.35	18.23	PL	6
Tulcea	45.18	28.81	RO	6
Wadgaon Kolhati	19.84	75.24	IN	6
Babu	24.42	111.52	CN	6
Souq Sebt Oulad Nemma	32.30	-6.70	MA	6
Barreirinhas	-2.76	-42.83	BR	6
Chivilcoy	-34.90	-60.02	AR	6
Lādnūn	27.65	74.40	IN	6
Ioánnina	39.66	20.85	GR	6
Wufeng	24.06	120.70	TW	6
Fleetwood	49.17	-122.80	CA	6
Bom Jesus da Lapa	-13.26	-43.42	BR	6
Nūrābād	34.07	47.97	IR	6
Korba	36.58	10.86	TN	6
Basirpur	30.58	73.84	PK	6
Piripiri	-4.27	-41.78	BR	6
Yebaishou	41.40	119.64	CN	6
Huaiyuan Chengguanzhen	32.96	117.17	CN	6
San Clemente	33.43	-117.61	US	6
West Lynchburg	37.40	-79.18	US	6
Iganga	0.61	33.47	UG	6
Middletown	40.39	-74.12	US	6
Burām	10.86	25.16	SD	6
Dār Kulayb	26.07	50.50	BH	6
Afgooye	2.14	45.12	SO	6
Torremolinos	36.62	-4.50	ES	6
Sattahip	12.67	100.90	TH	6
Sokhumi	43.01	40.99	GE	6
Supaul	26.12	86.60	IN	6
Ellesmere Port Town	53.28	-2.90	GB	6
Narok	-1.08	35.87	KE	6
São Félix do Xingu	-6.64	-51.99	BR	6
Fīrūzābād	28.84	52.57	IR	6
Framingham Center	42.30	-71.44	US	6
Itapoã	-15.75	-47.77	BR	6
Colmar	48.08	7.36	FR	6
Ārān Bīdgol	34.06	51.48	IR	6
Głogów	51.66	16.08	PL	6
Tendō	38.35	140.37	JP	6
Torquay	50.46	-3.53	GB	6
Bāqershahr	35.53	51.40	IR	6
Bianzhuang	34.85	118.04	CN	6
Aïn M’Lila	36.04	6.57	DZ	6
Meleuz	52.96	55.93	RU	6
Ban Khoan	20.35	100.09	LA	6
Tultepec	19.68	-99.13	MX	6
Suyangshan	34.39	117.76	CN	6
Kumertau	52.76	55.79	RU	6
Gangārāmpur	25.40	88.53	IN	6
Ramanathapuram	9.37	78.83	IN	6
Herten	51.60	7.14	DE	6
Jagraon	30.79	75.47	IN	6
Schenectady	42.81	-73.94	US	6
Perai	5.38	100.38	MY	6
Urgut Shahri	39.42	67.26	UZ	6
Sinnar	19.85	74.00	IN	6
Hepingjie	42.06	126.92	CN	6
Salamá	15.10	-90.32	GT	6
Kopargaon	19.88	74.48	IN	6
Skhirate	33.85	-7.03	MA	6
Acaraú	-2.89	-40.12	BR	6
Nioko I	12.40	-1.44	BF	6
Tulungagung	-8.07	111.90	ID	6
Liuxin	34.37	117.11	CN	6
Capelle aan den IJssel	51.93	4.58	NL	6
Gushikawa	26.36	127.87	JP	6
Ouricuri	-7.88	-40.08	BR	6
Caoqiao	34.34	118.11	CN	6
Manhiça	-25.40	32.81	MZ	6
Alīpur Duār	26.48	89.52	IN	6
Belize City	17.50	-88.20	BZ	6
Lala Musa	32.70	73.96	PK	6
Slavyansk-na-Kubani	45.25	38.12	RU	6
Irpin	50.52	30.24	UA	6
Januária	-15.48	-44.37	BR	6
Fengrun	39.83	118.14	CN	6
Cheyenne	41.14	-104.82	US	6
Lalmonirhat	25.92	89.45	BD	6
Aquiraz	-3.90	-38.39	BR	6
Tandur	17.25	77.58	IN	6
Ambarawa	-7.26	110.40	ID	6
Ouezzane	34.80	-5.58	MA	6
Kalush	49.02	24.37	UA	6
Villasis	15.90	120.59	PH	6
Estância	-11.27	-37.44	BR	6
Itaberaba	-12.53	-40.31	BR	6
Broomfield	39.92	-105.09	US	6
Ames	42.03	-93.62	US	6
Shawnee	39.04	-94.72	US	6
Mecheria	33.54	-0.28	DZ	6
Kunyang	27.67	120.57	CN	6
Bāzārak	35.31	69.52	AF	6
Ganda	-13.02	14.64	AO	6
Patuakhali	22.37	90.35	BD	6
Cricklewood	51.56	-0.22	GB	6
King Faisal Military City	28.45	45.97	SA	6
Itauguá	-25.39	-57.35	PY	6
Pampatar	11.00	-63.79	VE	6
Conway	35.09	-92.44	US	6
Embu	-0.54	37.46	KE	6
Sumusţā al Waqf	28.92	30.85	EG	6
Tianzhuang	36.80	119.74	CN	6
Villa del Rosario	7.83	-72.47	CO	6
East Orange	40.77	-74.20	US	6
Khulm	36.70	67.70	AF	6
Gitega	-3.43	29.92	BI	6
Sodegaura	35.41	140.02	JP	6
Bodītī	6.97	37.87	ET	6
Busia	0.47	34.09	UG	6
Oas	13.26	123.50	PH	6
Kolonnawa	6.93	79.88	LK	6
Azul	-36.78	-59.86	AR	6
Loughborough	52.77	-1.20	GB	6
Herford	52.11	8.67	DE	6
Lingao	19.91	109.69	CN	6
Hita	33.32	130.94	JP	6
Igarapé Miri	-1.98	-48.96	BR	6
Tongaat	-29.57	31.12	ZA	6
Skokie	42.03	-87.73	US	6
Shikang	21.77	109.32	CN	6
Bezerros	-8.23	-35.80	BR	6
Massa	44.04	10.14	IT	6
Grevenbroich	51.09	6.58	DE	6
Čair	42.02	21.44	MK	6
Tecate	32.57	-116.63	MX	6
Dishnā	26.12	32.47	EG	6
Rechytsa	52.36	30.39	BY	6
Khatauli	29.28	77.73	IN	6
Weimar	50.98	11.33	DE	6
Bertioga	-23.85	-46.14	BR	6
Hwawŏn	35.80	128.50	KR	6
Fenggang	27.55	116.21	CN	6
Vīrarāghavapuram	13.07	80.11	IN	6
Ahlat	38.75	42.48	TR	6
Asahi	35.72	140.65	JP	6
West Bloomfield Township	42.57	-83.38	US	6
Tamarac	26.21	-80.25	US	6
Yendi	9.44	-0.01	GH	6
Monte Mor	-22.95	-47.32	BR	6
Siuri	23.91	87.53	IN	6
Rāipur	23.04	90.77	BD	6
Itaitinga	-3.97	-38.53	BR	6
Meulaboh	4.14	96.13	ID	6
Dondo	-9.68	14.43	AO	6
Malanville	11.87	3.38	BJ	6
Usta Muhammad	28.18	68.04	PK	6
Youngstown	41.10	-80.65	US	6
Taunton	51.01	-3.10	GB	6
Tomigusuku	26.19	127.68	JP	6
Talavera	15.59	120.92	PH	6
Chacao	10.50	-66.85	VE	6
Guasdualito	7.24	-70.73	VE	6
Crotone	39.08	17.13	IT	6
Lodi	38.13	-121.27	US	6
La Línea de la Concepción	36.17	-5.35	ES	6
Picheng	34.47	117.97	CN	6
Renzhao	36.64	120.20	CN	6
Kotikawatta	6.93	79.91	LK	6
Haskovo	41.93	25.56	BG	6
Puerto Madryn	-42.77	-65.04	AR	6
Fujioka	36.25	139.07	JP	6
Muncar	-8.43	114.33	ID	6
Bīna	24.17	78.19	IN	6
Koboko	3.41	30.96	UG	6
Pālitāna	21.53	71.82	IN	6
Taman Senawang Indah	2.69	101.99	MY	6
Changli	39.71	119.16	CN	6
Yanagawa	33.17	130.40	JP	6
Afragola	40.92	14.31	IT	6
Preaek Prasab	12.35	106.04	KH	6
Akşehir	38.36	31.42	TR	6
Sahuayo de Morelos	20.06	-102.72	MX	6
Celina	33.32	-96.78	US	6
Chaumu	27.17	75.72	IN	6
Bandar Seri Begawan	4.89	114.94	BN	6
Kaihua	23.37	104.28	CN	6
Yunmeng Chengguanzhen	31.06	113.77	CN	6
Tikhoretsk	45.85	40.12	RU	6
Gelang Patah	1.45	103.59	MY	6
Bantul	-7.89	110.33	ID	6
Waterlooville	50.88	-1.03	GB	6
Sandefjord	59.13	10.22	NO	6
Imaichi	36.72	139.68	JP	6
Rossosh’	51.12	38.51	RU	6
Montenegro	-29.69	-51.46	BR	6
Maison Blanche	48.83	2.35	FR	6
Gimbi	9.17	35.83	ET	6
Sheptytskyi	50.39	24.24	UA	6
Tamana	32.95	130.57	JP	6
Enrique B. Magalona	10.88	122.98	PH	6
Kaposvár	46.37	17.80	HU	6
Mansfield	32.56	-97.14	US	6
Hālol	22.50	73.47	IN	6
T’aet’an-ŭp	38.09	125.30	KP	6
Taloqan	36.74	69.53	AF	6
Ongjin	37.93	125.36	KP	6
Punta Alta	-38.88	-62.08	AR	6
Kodār	17.00	79.97	IN	6
Tuapse	44.10	39.08	RU	6
Alba Iulia	46.07	23.58	RO	6
Kerpen	50.87	6.70	DE	6
Skanes	35.77	10.79	TN	6
Santa Cruz	36.97	-122.03	US	6
Pico Rivera	33.98	-118.10	US	6
Bāngarda Chhota	22.74	75.81	IN	6
Tshela	-5.00	12.95	CD	6
Madera	36.96	-120.06	US	6
Vacaria	-28.51	-50.93	BR	6
Uga	5.94	7.08	NG	6
Fria	10.37	-13.58	GN	6
Tādepalle	16.48	80.60	IN	6
Koulikoro	12.86	-7.56	ML	6
Tirupattur	12.49	78.57	IN	6
Janesville	42.68	-89.02	US	6
Surubim	-7.83	-35.75	BR	6
Ali Mendjeli	36.25	6.57	DZ	6
Boryspil	50.35	30.95	UA	6
West Des Moines	41.58	-93.71	US	6
Villa Elisa	-25.37	-57.59	PY	6
Aleksandrov	56.40	38.71	RU	6
Narutochō-mitsuishi	34.20	134.61	JP	6
Santiago	-13.53	-71.98	PE	6
Sibi	29.54	67.88	PK	6
Molina de Segura	38.05	-1.21	ES	6
Ihnāsīyah	29.09	31.02	EG	6
Mutengene	4.09	9.31	CM	6
Chinnachowk	14.48	78.84	IN	6
Bishnupur	23.07	87.32	IN	6
Paterna	39.50	-0.44	ES	6
Āmūr	18.79	78.28	IN	6
Palaió Fáliro	37.93	23.70	GR	6
Wik’ro	13.80	39.60	ET	6
Polomolok	6.22	125.06	PH	6
Ensenada	-34.86	-57.91	AR	6
Baheri	28.77	79.50	IN	6
Nawalgarh	27.85	75.27	IN	6
Tupã	-21.93	-50.51	BR	6
Paranoá	-15.78	-47.78	BR	6
Montebello	34.01	-118.11	US	6
Ānaiyūr	9.96	78.11	IN	6
Kunnamkulam	10.65	76.07	IN	6
Tulangan Utara	-7.47	112.65	ID	6
Bognor Regis	50.78	-0.68	GB	6
Ambanja	-13.67	48.45	MG	6
Colón	22.72	-80.90	CU	6
Rāghogarh	24.44	77.20	IN	6
San Antonio de Los Altos	10.39	-66.95	VE	6
Tohāna	29.71	75.90	IN	6
Kangar	6.44	100.20	MY	6
Valence	44.93	4.91	FR	6
Newtownabbey	54.66	-5.91	GB	6
Cosenza	39.30	16.25	IT	6
Quimper	48.00	-4.10	FR	6
Pateros	14.54	121.07	PH	6
San Pedro de Copán	14.62	-88.87	HN	6
Thành Phố Uông Bí	21.03	106.77	VN	6
Dengbu	28.21	116.82	CN	6
Pindi Gheb	33.24	72.26	PK	6
Machakos	-1.52	37.27	KE	6
Kulai	1.66	103.60	MY	6
Fulda	50.55	9.68	DE	6
Yangcun	39.36	117.06	CN	6
Shendi	16.69	33.43	SD	6
Magong	23.57	119.59	TW	6
Mpika	-11.83	31.45	ZM	6
Boké	10.93	-14.29	GN	6
Georgetown	30.63	-97.68	US	6
Mangai	-4.02	19.53	CD	6
As Safīrah	36.08	37.37	SY	6
Lulou	34.72	116.77	CN	6
‘Alemaya	9.39	42.01	ET	6
Bongor	10.28	15.37	TD	6
Kanchanaburi	14.00	99.55	TH	6
Jatani	20.16	85.71	IN	6
Chokwé	-24.53	32.98	MZ	6
Alpharetta	34.08	-84.29	US	6
Fujiidera	34.57	135.60	JP	6
Arni	12.67	79.29	IN	6
Genk	50.97	5.50	BE	6
Shimodate	36.30	139.98	JP	6
Yambol	42.48	26.50	BG	6
Chik Ballāpur	13.44	77.73	IN	6
Kilju	40.96	129.33	KP	6
Lorain	41.45	-82.18	US	6
Baihecun	22.11	107.24	CN	6
Dédougou	12.46	-3.46	BF	6
Bowling Green	36.99	-86.44	US	6
Nong Khai	17.88	102.74	TH	6
Guanyin	29.10	104.39	CN	6
Dundalk	39.25	-76.52	US	6
Capão da Canoa	-29.75	-50.01	BR	6
New Halfa	15.33	35.60	SD	6
Dormagen	51.10	6.83	DE	6
Zarechnyy	53.20	45.19	RU	6
Užice	43.86	19.85	RS	6
Buckley	53.17	-3.08	GB	6
Mabai	23.01	104.45	CN	6
Benevides	-1.36	-48.24	BR	6
Leszno	51.84	16.57	PL	6
Bergheim	50.96	6.64	DE	6
Nago	26.62	127.99	JP	6
El Mgarsa	33.82	10.99	TN	6
Ganta	7.24	-8.98	LR	6
Jelutong	5.39	100.32	MY	6
Samut Sakhon	13.55	100.27	TH	6
Eden Prairie	44.85	-93.47	US	6
Jitra	6.27	100.42	MY	6
Slatina	44.43	24.37	RO	6
North Bergen	40.80	-74.01	US	6
Zayed City	23.65	53.71	AE	6
Most	50.50	13.64	CZ	6
Korydallós	37.98	23.65	GR	6
Great Yarmouth	52.61	1.73	GB	6
Buin	-33.73	-70.74	CL	6
El Prat de Llobregat	41.33	2.09	ES	6
Nanlong	31.35	106.06	CN	6
Mitcham	51.40	-0.17	GB	6
Dhubri	26.02	89.99	IN	6
Florence-Graham	33.97	-118.24	US	6
Youxi	29.21	106.14	CN	6
Waltham	42.38	-71.24	US	6
Borsad	22.41	72.90	IN	6
Feltham	51.45	-0.41	GB	6
Siddharthanagar	27.50	83.45	NP	6
Garbsen	52.41	9.59	DE	6
Zagné	6.21	-7.48	CI	6
Pavlovo	55.97	43.09	RU	6
Mirassol	-20.82	-49.52	BR	6
Margate	51.38	1.39	GB	6
Githunguri	-1.06	36.78	KE	6
Kenge	-5.77	13.66	CD	6
Mercedes	-34.65	-59.43	AR	6
West Hartford	41.76	-72.74	US	6
Kelaa Kebira	35.87	10.54	TN	6
Mila	36.45	6.26	DZ	6
Padre Hurtado	-33.57	-70.81	CL	6
Cajazeiras	-6.89	-38.56	BR	6
Buduburam	5.52	-0.48	GH	6
Gorno-Altaysk	51.96	85.92	RU	6
Changcheng	36.09	119.45	CN	6
Shanwang	36.55	118.71	CN	6
Lugano	46.01	8.96	CH	6
Gadwāl	16.24	77.80	IN	6
Kuşadası	37.86	27.26	TR	6
Tetovo	42.01	20.97	MK	6
Hod HaSharon	32.16	34.89	IL	6
Żory	50.05	18.70	PL	6
Godean	-7.77	110.29	ID	6
Rogers	36.33	-94.12	US	6
Medicine Hat	50.04	-110.68	CA	6
Lushnjë	40.94	19.70	AL	6
Qurayyāt	23.26	58.92	OM	6
Fredericton	45.95	-66.67	CA	6
Pidugurālla	16.48	79.89	IN	6
Melipilla	-33.69	-71.22	CL	6
Novaya Balakhna	56.49	43.60	RU	6
Limón	9.99	-83.04	CR	6
Collado-Villalba	40.64	-4.00	ES	6
Botou	38.07	116.57	CN	6
Orion	14.62	120.58	PH	6
Uiwang	37.37	126.95	KR	6
Vaslui	46.63	27.73	RO	6
Carol City	25.94	-80.25	US	6
Pubal	37.29	127.51	KR	6
Agnibilékrou	7.13	-3.20	CI	6
Liuku	25.85	98.86	CN	6
Los Andes	-32.83	-70.60	CL	6
Florida	21.53	-78.23	CU	6
Kélibia	36.85	11.09	TN	6
Baoqing	46.32	132.19	CN	6
Urla	38.32	26.76	TR	6
Horad Zhodzina	54.10	28.33	BY	6
Nkwerre	5.76	7.10	NG	6
Mong Kok	22.32	114.17	HK	6
Al Bājūr	30.43	31.04	EG	6
Shizhai	34.81	116.64	CN	6
Halton Hills	43.64	-79.93	CA	6
Encinitas	33.04	-117.29	US	6
Sheikhpura	25.14	85.84	IN	6
Jinggou	36.28	119.55	CN	6
Māhdāsht	35.73	50.81	IR	6
Auchi	7.07	6.26	NG	6
Bełchatów	51.37	19.36	PL	6
Graaff Reinet	-32.25	24.53	ZA	6
Campo Bom	-29.68	-51.05	BR	6
Sirsi	14.62	74.84	IN	6
Nipāni	16.40	74.38	IN	6
Sorgun	39.81	35.19	TR	6
Fanlou	34.48	116.85	CN	6
Nasugbu	14.07	120.63	PH	6
Kannur	11.87	75.36	IN	6
Tagajō-shi	38.30	141.00	JP	6
Butare	-2.60	29.74	RW	6
Trnava	48.38	17.59	SK	6
Randers	56.46	10.04	DK	6
Moknine	35.63	10.90	TN	6
Caltanissetta	37.49	14.06	IT	6
Ashford	51.15	0.87	GB	6
Haverhill	42.78	-71.08	US	6
Sumbawa Besar	-8.49	117.42	ID	6
Gus’-Khrustal’nyy	55.61	40.65	RU	6
Pesqueira	-8.36	-36.70	BR	6
Bāri	26.65	77.62	IN	6
Jupiter	26.93	-80.09	US	6
Nokha	27.56	73.47	IN	6
Santa Lucía	-31.54	-68.50	AR	6
Dovzhansk	48.08	39.65	UA	6
Puerto Peñasco	31.32	-113.54	MX	6
Buynaksk	42.82	47.13	RU	6
Tiquipaya	-17.34	-66.22	BO	6
Icó	-6.40	-38.86	BR	6
Semporna	4.48	118.61	MY	6
Çubuk	40.24	33.03	TR	6
Krasnoturinsk	59.77	60.21	RU	6
Council Bluffs	41.26	-95.86	US	6
Phitsanulok	16.82	100.26	TH	6
Belebey	54.11	54.12	RU	6
Pedro Leopoldo	-19.62	-44.04	BR	6
Nyunzu	-5.96	28.02	CD	6
Wellington	26.66	-80.24	US	6
Sale	53.43	-2.32	GB	6
Vinukonda	16.05	79.74	IN	6
Tonypandy	51.62	-3.46	GB	6
Miaojie	25.31	100.28	CN	6
Kaitong	44.81	123.08	CN	6
West Coon Rapids	45.16	-93.35	US	6
Colón	8.03	-72.26	VE	6
Portel	-1.94	-50.82	BR	6
Zhangjiachuan	34.99	106.21	CN	6
Drancy	48.93	2.45	FR	6
Pingnan	23.54	110.39	CN	6
Acton	51.51	-0.28	GB	6
Phalia	32.43	73.58	PK	6
Kosong	38.38	128.47	KR	6
Ntoum	0.39	9.76	GA	6
Shiroi	35.80	140.07	JP	6
North Miami	25.89	-80.19	US	6
Pervomaysk	48.04	30.85	UA	6
Noisy-le-Grand	48.85	2.56	FR	6
Fochville	-26.49	27.49	ZA	6
Renukūt	24.22	83.04	IN	6
Mohammadia	35.59	0.07	DZ	6
Érd	47.39	18.91	HU	6
Hamilton	39.40	-84.56	US	6
Dêqên	29.96	90.72	CN	6
Villeneuve-d'Ascq	50.62	3.17	FR	6
Songyang	34.46	113.03	CN	6
Salgueiro	-8.07	-39.12	BR	6
Grao de Murviedro	39.64	-0.24	ES	6
Yucheng	34.93	116.47	CN	6
Benslimane	33.62	-7.12	MA	6
North Port	27.04	-82.24	US	6
Marechal Deodoro	-9.71	-35.90	BR	6
La Seyne-sur-Mer	43.10	5.88	FR	6
Camocim	-2.90	-40.84	BR	6
Shuikou	23.98	115.90	CN	6
Tulare	36.21	-119.35	US	6
Ras Tanura	26.71	50.07	SA	6
Humaitá	-7.52	-63.03	BR	6
Kogon Shahri	39.73	64.55	UZ	6
Nagari	13.32	79.59	IN	6
Escada	-8.36	-35.22	BR	6
Abepura	-2.60	140.63	ID	6
Sopron	47.69	16.59	HU	6
Rzhev	56.26	34.33	RU	6
Coon Rapids	45.12	-93.29	US	6
Berat	40.71	19.95	AL	6
Camaquã	-30.85	-51.81	BR	6
Chistopol’	55.37	50.64	RU	6
Asaka	40.64	72.24	UZ	6
Levallois-Perret	48.89	2.29	FR	6
Huaral	-11.49	-77.21	PE	6
Inhulets	47.73	33.25	UA	6
Boituva	-23.28	-47.67	BR	6
Viareggio	43.87	10.25	IT	6
Nioki	-2.72	17.69	CD	6
Chidambaram	11.40	79.69	IN	6
Tanba	35.16	135.04	JP	6
Tinongan	10.21	123.04	PH	6
Millcreek	40.69	-111.88	US	6
Shuangyang	43.52	125.66	CN	6
Nianzishan	47.51	122.89	CN	6
La Habra	33.93	-117.95	US	6
Blaine	45.16	-93.23	US	6
Dabwāli	29.95	74.74	IN	6
Sibsāgar	26.98	94.64	IN	6
Narwāna	29.60	76.12	IN	6
Yangambi	0.77	24.44	CD	6
Tikhvin	59.64	33.53	RU	6
Sagua la Grande	22.81	-80.07	CU	6
Minglanilla	10.24	123.80	PH	6
Okha	22.47	69.07	IN	6
Kiffa	16.62	-11.40	MR	6
Pingyin	36.28	116.45	CN	6
Lār	27.68	54.34	IR	6
Floriano	-6.77	-43.02	BR	6
Sanghar	26.05	68.95	PK	6
Korogwe	-5.15	38.48	TZ	6
Nova Odessa	-22.78	-47.30	BR	6
Łomża	53.18	22.06	PL	6
Bin Xian	45.74	127.46	CN	6
Kempas	1.55	103.70	MY	6
Meshkīn Dasht	35.75	50.94	IR	6
Qingshuping	27.38	112.02	CN	6
Mīzan Teferī	7.00	35.59	ET	6
Nani Daman	20.41	72.83	IN	6
Seremban 2	2.69	101.91	MY	6
Smederevo	44.66	20.93	RS	6
gorod Solnetchnogorsk	56.19	36.98	RU	6
Irun	43.34	-1.79	ES	6
Lake Elsinore	33.67	-117.33	US	6
Zhaobaoshan	29.97	121.69	CN	6
Hushitai	41.94	123.50	CN	6
Petrodvorets	59.90	29.80	RU	6
Kuchāman	27.15	74.86	IN	6
Miyoshi	35.09	137.09	JP	6
Nīmbāhera	24.62	74.68	IN	6
Labinsk	44.64	40.74	RU	6
Tenkodogo	11.78	-0.37	BF	6
Zhangji	34.14	117.38	CN	6
Marseille 14	43.34	5.38	FR	6
Maputsoe	-28.89	27.90	LS	6
Asker	59.83	10.44	NO	6
Huoqiu Chengguanzhen	32.35	116.29	CN	6
Mudu	31.26	120.52	CN	6
Zalaegerszeg	46.84	16.84	HU	6
Fengyi	25.58	100.31	CN	6
Nandu	22.85	110.82	CN	6
Pisco	-13.71	-76.21	PE	6
Siddhapur	23.92	72.37	IN	6
Bāmyān	34.82	67.83	AF	6
Taoluo	35.27	119.37	CN	6
Bassar	9.25	0.78	TG	6
Moca	19.39	-70.52	DO	6
Zamora	41.51	-5.74	ES	6
Iskitim	54.64	83.30	RU	6
Kiryat Gat	31.61	34.76	IL	6
Svetlogorsk	52.63	29.74	BY	6
Carazinho	-28.28	-52.79	BR	6
Diphu	25.84	93.43	IN	6
Attur	11.59	78.60	IN	6
Darāw	24.41	32.92	EG	6
Beni Enzar	35.26	-2.93	MA	6
Revda	56.80	59.94	RU	6
Long Mỹ	9.68	105.57	VN	6
Kōshi	32.89	130.78	JP	6
Lobnya	56.03	37.47	RU	6
Yingshang Chengguanzhen	32.63	116.27	CN	6
San Andrés Tuxtla	18.45	-95.21	MX	6
Carmichael	38.62	-121.33	US	6
Songkhla	7.20	100.60	TH	6
Kokstad	-30.55	29.42	ZA	6
Kampong Cham	11.99	105.46	KH	6
Scarborough	54.28	-0.40	GB	6
Rāyadrug	14.70	76.85	IN	6
Xiangzhou	36.16	119.42	CN	6
Yamato-Takada	34.52	135.75	JP	6
Rāth	25.59	79.57	IN	6
Ngozi	-2.91	29.83	BI	6
Al Shamkhah City	24.39	54.71	AE	6
Lakshmīpur	22.94	90.83	BD	6
Yangiyŭl	41.11	69.05	UZ	6
Yongning	22.76	108.48	CN	6
Wesel	51.67	6.62	DE	6
Penápolis	-21.42	-50.08	BR	6
Vyksa	55.32	42.17	RU	6
Cortazar	20.48	-100.96	MX	6
Tríkala	39.55	21.77	GR	6
Kolea	36.64	2.77	DZ	6
Chambéry	45.57	5.92	FR	6
Kolding	55.49	9.47	DK	6
Extremoz	-5.71	-35.31	BR	6
Xinye	32.53	112.37	CN	6
Cheruvannur	11.19	75.83	IN	6
Ad Dir‘īyah	24.75	46.54	SA	6
Dmitrov	56.34	37.52	RU	6
Ueno-ebisumachi	34.76	136.13	JP	6
Sibay	52.72	58.67	RU	6
Faqirwali	29.47	73.03	PK	6
Lishu	43.31	124.33	CN	6
Oroqen Zizhiqi	50.57	123.72	CN	6
Béja	36.73	9.18	TN	6
Taylor	42.24	-83.27	US	6
La Fría	8.22	-72.25	VE	6
Alcoy	38.71	-0.47	ES	6
Cayenne	4.94	-52.33	GF	6
Hasuda	35.97	139.65	JP	6
Gaya	11.88	3.45	NE	6
Xianju	28.85	120.73	CN	6
Aş Şaff	29.56	31.28	EG	6
Malaybalay	8.16	125.13	PH	6
Mora	11.05	14.14	CM	6
Porirua	-41.13	174.85	NZ	6
Vriddhāchalam	11.52	79.32	IN	6
Korosten	50.95	28.64	UA	6
Karlstad	59.38	13.50	SE	6
Nieuwegein	52.03	5.08	NL	6
Burnsville	44.77	-93.28	US	6
Andradina	-20.90	-51.38	BR	6
Tamba	35.17	135.03	JP	6
Bārh	25.48	85.71	IN	6
Jianguang	28.19	115.78	CN	6
Monterey Park	34.06	-118.12	US	6
Widnes	53.36	-2.73	GB	6
Djibo	14.10	-1.63	BF	6
Euclides da Cunha	-10.51	-39.02	BR	6
Issy-les-Moulineaux	48.82	2.28	FR	6
Morada Nova	-5.11	-38.37	BR	6
Dongning	44.08	131.12	CN	6
Aketi	2.74	23.78	CD	6
Dashi	30.09	106.22	CN	6
Stryi	49.26	23.85	UA	6
Kempten (Allgäu)	47.73	10.31	DE	6
Mdiq	35.68	-5.33	MA	6
Abū Ḩummuş	31.09	30.31	EG	6
Castro Valley	37.69	-122.09	US	6
Mariana	-20.38	-43.42	BR	6
Shāhāda	21.55	74.47	IN	6
Tunasan	14.38	121.05	PH	6
Sig	35.53	-0.19	DZ	6
San Salvador Tizatlalli	19.26	-99.59	MX	6
Coroatá	-4.13	-44.12	BR	6
Arrecife	28.96	-13.55	ES	6
Savona	44.31	8.48	IT	6
Mushie	-3.02	16.92	CD	6
Irvington	40.73	-74.23	US	6
Sindelfingen	48.70	9.02	DE	6
Výronas	37.96	23.75	GR	6
Mojo	8.59	39.12	ET	6
Neuilly-sur-Seine	48.88	2.27	FR	6
Tianchang	38.00	114.02	CN	6
Mizusawa	39.13	141.13	JP	6
Dabra	25.89	78.33	IN	6
Veenendaal	52.03	5.56	NL	6
Mateare	12.24	-86.43	NI	6
La Chorrera	8.88	-79.78	PA	6
Kuroiso	36.97	140.05	JP	6
Tauá	-6.00	-40.29	BR	6
Nova Mutum	-13.83	-56.08	BR	6
Schwäbisch Gmünd	48.80	9.80	DE	6
Rocklin	38.79	-121.24	US	6
Slawi	-6.98	109.14	ID	6
Gaalkacyo	6.77	47.43	SO	6
Apatity	67.58	33.41	RU	6
Chichibu	35.99	139.08	JP	6
Kesennuma	38.90	141.58	JP	6
Caicó	-6.46	-37.10	BR	6
Runcorn	53.34	-2.73	GB	6
Udumalaippettai	10.59	77.25	IN	6
Dembī Dolo	8.53	34.80	ET	6
Utica	43.10	-75.23	US	6
Gubat	12.92	124.12	PH	6
Dar Naim	18.11	-15.93	MR	6
Xifeng	42.74	124.72	CN	6
Punta de Mata	9.69	-63.61	VE	6
Horsens	55.86	9.85	DK	6
Banfield	-34.75	-58.39	AR	6
Malden	42.43	-71.07	US	6
Biga	40.23	27.24	TR	6
Hashimoto	34.32	135.62	JP	6
National City	32.68	-117.10	US	6
Novoaltaysk	53.41	83.94	RU	6
Pecangaan	-6.70	110.71	ID	6
Bury	53.60	-2.30	GB	6
Dewsbury	53.69	-1.63	GB	6
Valjevo	44.28	19.90	RS	6
Nanhu	35.49	119.35	CN	6
Yicheng	31.70	112.26	CN	6
Svobodnyy	51.37	128.14	RU	6
Bangor	54.66	-5.67	GB	6
Ban Tha Kham	13.64	100.44	TH	6
Itoman	26.13	127.67	JP	6
Felege Neway	6.30	36.88	ET	6
Villa Poeta José Gálvez Barrenechea	-12.21	-76.91	PE	6
Sal’sk	46.47	41.54	RU	6
Stupino	54.90	38.07	RU	6
Nekā	36.65	53.30	IR	6
Parit	4.48	100.92	MY	6
Kampong Sidam	5.53	100.57	MY	6
Granollers	41.61	2.29	ES	6
Fano	43.84	13.02	IT	6
Chinch'ŏn	36.86	127.44	KR	6
Tiptūr	13.26	76.48	IN	6
Sahaswān	28.07	78.75	IN	6
Wanparti	16.37	78.07	IN	6
Zeist	52.09	5.23	NL	6
Sidi Bennour	32.65	-8.43	MA	6
Anuradhapura	8.31	80.41	LK	6
Tarnowskie Góry	50.45	18.86	PL	6
Xiema	29.77	106.37	CN	6
Buluan	6.72	124.80	PH	6
Grosseto	42.76	11.11	IT	6
Kırıkhan	36.50	36.36	TR	6
Soroti	1.71	33.61	UG	6
Yanliang	34.66	109.23	CN	6
União dos Palmares	-9.16	-36.03	BR	6
Tahe	52.32	124.70	CN	6
Mbinga	-10.93	35.02	TZ	6
Bethesda	38.98	-77.10	US	6
San Miguel	-15.48	-70.12	PE	6
Uyovu	-3.28	31.53	TZ	6
Norfolk County	42.83	-80.38	CA	6
Sirhind	30.64	76.38	IN	6
Dayr Mawās	27.64	30.85	EG	6
Jōsō	36.04	139.96	JP	6
Erdaojiang	41.78	126.03	CN	6
Aisai	35.16	136.73	JP	6
Terre Haute	39.47	-87.41	US	6
Bārdoli	21.12	73.11	IN	6
Kolomyia	48.52	25.04	UA	6
Tartagal	-22.52	-63.81	AR	6
Vineland	39.49	-75.03	US	6
Prokhladnyy	43.76	44.03	RU	6
Fort Portal	0.66	30.27	UG	6
Tianpeng	30.99	103.94	CN	6
Troyes	48.30	4.09	FR	6
Kertosono	-7.58	112.10	ID	6
Stodůlky	50.05	14.32	CZ	6
Sarandí	-34.68	-58.35	AR	6
Beckenham	51.41	-0.03	GB	6
Yazman	29.12	71.74	PK	6
Seraing	50.58	5.50	BE	6
San Marcos	8.66	-75.13	CO	6
Chicacao	14.54	-91.33	GT	6
Novo Repartimento	-4.33	-49.80	BR	6
El Wak	2.81	40.93	KE	6
Gilgil	-0.50	36.32	KE	6
Upper Gilgil	-0.21	36.27	KE	6
Shuya	56.85	41.39	RU	6
Shchëkino	54.01	37.51	RU	6
Ban Lam Luk Ka	13.98	100.78	TH	6
Towada	40.62	141.21	JP	6
Mokameh	25.40	85.92	IN	6
Yaowan	34.18	118.07	CN	6
Brentwood	40.78	-73.25	US	6
Farnborough	51.29	-0.76	GB	6
Bor	56.36	44.07	RU	6
Givatayim	32.07	34.81	IL	6
Arāmbāgh	22.88	87.78	IN	6
Lakeville	44.65	-93.24	US	6
Mujiayingzi	42.12	118.78	CN	6
West Allis	43.02	-88.01	US	6
Yame	33.23	130.65	JP	6
Poonamalle	13.05	80.11	IN	6
Tynemouth	55.02	-1.43	GB	6
Akim Oda	5.93	-0.99	GH	6
Dubna	56.74	37.19	RU	6
Redmond	47.67	-122.12	US	6
Motril	36.75	-3.52	ES	6
Kinokawa	34.27	135.41	JP	6
Keonjhargarh	21.63	85.60	IN	6
Tacuarembó	-31.72	-55.98	UY	6
Dingjia	29.41	106.14	CN	6
Mene Grande	9.85	-70.93	VE	6
Lokoja	7.80	6.74	NG	6
Cupertino	37.32	-122.03	US	6
Bhadravati	20.10	79.11	IN	6
Ualog	10.57	123.39	PH	6
Langzhong	31.55	105.99	CN	6
Ciudad Hidalgo	19.69	-100.56	MX	6
Taylorsville	40.67	-111.94	US	6
Takaishi	34.52	135.43	JP	6
Liancheng	25.72	116.75	CN	6
Jiangbei	29.73	106.64	CN	6
Moramanga	-18.95	48.23	MG	6
Bristol	41.67	-72.95	US	6
Moore	35.34	-97.49	US	6
Gardena	33.89	-118.31	US	6
Itapecuru Mirim	-3.39	-44.36	BR	6
Petaluma	38.23	-122.64	US	6
Fethiye	36.64	29.13	TR	6
Bensalem	40.10	-74.95	US	6
District of Taher	36.77	5.90	DZ	6
Zacapa	14.97	-89.53	GT	6
Hereford	52.06	-2.71	GB	6
Matera	40.67	16.60	IT	6
Midelt	32.69	-4.75	MA	6
Grand Junction	39.06	-108.55	US	6
Taitou	37.03	118.63	CN	6
Świdnica	50.84	16.49	PL	6
Cruz das Almas	-12.67	-39.10	BR	6
Olbia	40.92	9.50	IT	6
Mangochi	-14.48	35.26	MW	6
Gushu	31.56	118.48	CN	6
Sanyōonoda	34.03	131.16	JP	6
Panruti	11.78	79.55	IN	6
Al Burj	31.58	30.98	EG	6
Fenshui	30.72	108.08	CN	6
Casper	42.87	-106.31	US	6
Monze	-16.27	27.48	ZM	6
Setia Tropika	1.55	103.72	MY	6
Shimotsuke	36.41	139.87	JP	6
Wujing	36.45	118.40	CN	6
Opava	49.94	17.90	CZ	6
Ilkal	15.96	76.11	IN	6
Rowlett	32.90	-96.56	US	6
Vejle	55.71	9.54	DK	6
Chełm	51.14	23.47	PL	6
Cogan	10.59	124.02	PH	6
Kīratpur	29.51	78.21	IN	6
Wucheng	29.60	118.17	CN	6
Cristalina	-16.77	-47.62	BR	6
Yuxia	34.06	108.63	CN	6
Trinidad	21.80	-79.98	CU	6
Tahara	34.67	137.27	JP	6
Runan	33.00	114.35	CN	6
Parkent	41.29	69.68	UZ	6
Vrindāvan	27.58	77.70	IN	6
Douane	36.45	10.76	TN	6
Kodungallūr	10.23	76.20	IN	6
Penedo	-10.29	-36.59	BR	6
Bandar-e Kangān	27.83	52.06	IR	6
Vavuniya	8.75	80.50	LK	6
Ech Chettia	36.20	1.26	DZ	6
Zhijiang	30.42	111.75	CN	6
Rosenheim	47.86	12.12	DE	6
Nagakute	35.17	137.06	JP	6
Nedumangād	8.60	77.00	IN	6
Stroud	51.75	-2.20	GB	6
Gucheng	36.95	118.76	CN	6
Bambang	16.39	121.11	PH	6
Taozhuang	34.85	117.33	CN	6
Tczew	54.09	18.78	PL	6
Sandaohezi	44.33	85.62	CN	6
Pokrovsk	48.28	37.18	UA	6
Hpākān	25.61	96.31	MM	6
Ābyek	36.04	50.53	IR	6
Sennan	34.35	135.27	JP	6
Laascaanood	8.48	47.36	SO	6
Yongbei	26.65	100.78	CN	6
Halesowen	52.45	-2.05	GB	6
La Mesa	32.77	-117.02	US	6
Waterford	52.26	-7.11	IE	6
Pine Hills	28.56	-81.45	US	6
Martínez de la Torre	20.07	-97.06	MX	6
Kuwait City	29.37	47.97	KW	6
Zushi	35.29	139.58	JP	6
Pavlovskiy Posad	55.78	38.65	RU	6
Hyūga	32.42	131.64	JP	6
Dazeshan	36.99	119.92	CN	6
Ibitinga	-21.76	-48.83	BR	6
São Borja	-28.66	-56.00	BR	6
Sarāvān	27.37	62.33	IR	6
Monte Alegre	-2.00	-54.08	BR	6
Villa Vicente Guerrero	19.12	-98.17	MX	6
Nzagi	-8.39	15.30	AO	6
Hurlingham	-34.59	-58.63	AR	6
Zhujiajiao	31.11	121.06	CN	6
Wuzhen	30.75	120.49	CN	6
Santutxu	43.25	-2.92	ES	6
Juan-les-Pins	43.57	7.11	FR	6
Mbale	0.08	34.72	KE	6
Néma	16.62	-7.26	MR	6
Putra Heights	2.99	101.57	MY	6
Ara Damansara	3.12	101.59	MY	6
Bukit Indah	1.48	103.66	MY	6
Faruka	31.89	72.41	PK	6
Vinhomes Ocean Park	20.99	105.95	VN	6
Meriden	41.54	-72.81	US	6
Dại Mỗ	20.98	105.77	VN	6
Narsimhapur	22.95	79.18	IN	6
Tanay	14.50	121.28	PH	6
Registro	-24.49	-47.84	BR	6
Obando	14.71	120.94	PH	6
Uki	32.62	130.66	JP	6
Heroica Caborca	30.72	-112.16	MX	6
Pontiac	42.64	-83.29	US	6
Temerluh	3.45	102.42	MY	6
Hwasun	35.06	126.99	KR	6
Ponnur	16.07	80.55	IN	6
Acerra	40.94	14.37	IT	6
Jiangkou	25.49	119.20	CN	6
Maqin County	34.47	100.24	CN	6
Yamethin	20.43	96.14	MM	6
Kathua	32.37	75.53	IN	6
Port Orange	29.14	-81.00	US	6
Mérida	38.92	-6.34	ES	6
Boyolali	-7.53	110.60	ID	6
Hamden	41.40	-72.90	US	6
Antony	48.75	2.30	FR	6
Jacundá	-4.45	-49.12	BR	6
North Lakhimpur	27.24	94.10	IN	6
Cachoeiras de Macacu	-22.46	-42.65	BR	6
Pucheng	27.92	118.53	CN	6
Brandenburg an der Havel	52.42	12.55	DE	6
Balagtas	14.82	120.87	PH	6
Buyeo	36.27	126.91	KR	6
Masaurhi Buzurg	25.35	85.03	IN	6
Nerkunram	13.06	80.21	IN	6
Cosmópolis	-22.65	-47.20	BR	6
Kosai	34.70	137.52	JP	6
Fountainebleau	25.77	-80.35	US	6
Piekary Śląskie	50.38	18.93	PL	6
Itogon	16.36	120.68	PH	6
Békéscsaba	46.68	21.10	HU	6
Rüsselsheim am Main	49.99	8.42	DE	6
Zvishavane	-20.33	30.07	ZW	6
Saint Clair Shores	42.50	-82.89	US	6
Viçosa do Ceará	-3.56	-41.09	BR	6
Agía Paraskeví	38.02	23.83	GR	6
Metu	8.30	35.58	ET	6
Prachantakham	14.06	101.52	TH	6
Shegaon	20.79	76.70	IN	6
Pampán	9.45	-70.48	VE	6
Mandideep	23.08	77.53	IN	6
Katiola	8.14	-5.10	CI	6
Great Falls	47.50	-111.30	US	6
Ksar el Boukhari	35.89	2.75	DZ	6
Date	37.82	140.50	JP	6
Ekpoma	6.74	6.14	NG	6
Pāchora	20.67	75.35	IN	6
Itamaraju	-17.04	-39.53	BR	6
Nag Hammâdi	26.05	32.24	EG	6
Baimajing	19.71	109.22	CN	6
Tuanbao	30.34	109.13	CN	6
San Cristobal	22.72	-83.06	CU	6
Den Helder	52.96	4.76	NL	6
Chapel Hill	35.91	-79.06	US	6
Limoeiro do Norte	-5.15	-38.10	BR	6
Molfetta	41.20	16.60	IT	6
Altamira	22.39	-97.94	MX	6
Sengkang	-4.13	120.03	ID	6
Gobichettipalayam	11.45	77.44	IN	6
Gangoh	29.78	77.26	IN	6
Mielec	50.29	21.42	PL	6
Dayr al Balaḩ	31.42	34.35	PS	6
Ferizaj	42.37	21.16	XK	6
Shirakawa	37.12	140.26	JP	6
Itanagar	27.09	93.61	IN	6
Esfarāyen	37.08	57.51	IR	6
Drummondville	45.88	-72.48	CA	6
Comitancillo	15.09	-91.75	GT	6
Sonsonate	13.72	-89.72	SV	6
Wenshang	35.73	116.50	CN	6
Mölndal	57.66	12.01	SE	6
Huntington Park	33.98	-118.23	US	6
Meïganga	6.52	14.30	CM	6
La Roche-sur-Yon	46.67	-1.43	FR	6
Chikuma	36.53	138.09	JP	6
Ogōri	33.39	130.55	JP	6
Azrou	33.43	-5.22	MA	6
Galátsi	38.02	23.75	GR	6
Jaitpur	28.51	77.33	IN	6
Huiqu	36.27	119.05	CN	6
Aş Şāliḩīyah al Jadīdah	30.63	31.94	EG	6
Narasapur	16.43	81.70	IN	6
Coconut Creek	26.25	-80.18	US	6
Wendo	6.60	38.42	ET	6
San Felipe	-32.75	-70.73	CL	6
Dhone	15.40	77.87	IN	6
Irati	-25.47	-50.65	BR	6
Gannan	47.92	123.50	CN	6
Offenburg	48.47	7.94	DE	6
Craigavon	54.45	-6.39	GB	6
Aboisso	5.47	-3.21	CI	6
Lamongan	-7.12	112.42	ID	6
Pánlóngchéng Jīngjì Kāifāqū	30.69	114.27	CN	6
Nabarūh	31.10	31.30	EG	6
Leander	30.58	-97.85	US	6
Hongjiang	27.11	110.00	CN	6
Mikhaylovsk	45.13	42.03	RU	6
Rājgarh	28.64	75.39	IN	6
Sahagún	8.95	-75.44	CO	6
Jian’ou	27.04	118.32	CN	6
Idaho Falls	43.47	-112.03	US	6
Kotlas	61.26	46.65	RU	6
Fundación	10.52	-74.19	CO	6
Veliko Tŭrnovo	43.08	25.63	BG	6
Tashan	34.34	117.57	CN	6
San Rafael	37.97	-122.53	US	6
Jixian	46.73	131.13	CN	6
Hezuo	34.99	102.91	CN	6
Azua	18.45	-70.73	DO	6
Wanchaq	-13.52	-71.97	PE	6
Chalkída	38.46	23.60	GR	6
Oltinko‘l	43.07	58.90	UZ	6
Ullal	12.81	74.86	IN	6
Ābādeh	28.83	53.17	IR	6
Abadeh	31.16	52.65	IR	6
Manaoag	16.04	120.49	PH	6
Rio Bonito	-22.71	-42.61	BR	6
Langenfeld	51.11	6.95	DE	6
Umm Al Quwain City	25.56	55.56	AE	6
Haizhou	34.58	119.13	CN	6
Pierrefonds	45.46	-73.89	CA	6
Noblesville	40.05	-86.01	US	6
Panna	24.72	80.19	IN	6
Dilling	12.05	29.65	SD	6
Longgu	34.90	116.81	CN	6
Yigou	35.81	114.32	CN	6
Santo Tomé	-31.66	-60.77	AR	6
Yagoua	10.34	15.23	CM	6
Marietta	33.95	-84.55	US	6
San Francisco	-31.42	-62.08	AR	6
Verkhnyaya Pyshma	56.97	60.58	RU	6
As-Suwayda	32.71	36.57	SY	6
Talnakh	69.49	88.40	RU	6
Langtoucun	40.04	124.34	CN	6
Owensboro	37.77	-87.11	US	6
Jose Rizal	8.88	117.50	PH	6
Eastvale	33.96	-117.56	US	6
Sarpsborg	59.28	11.11	NO	6
Içara	-28.71	-49.30	BR	6
Simpang Renggam	1.82	103.31	MY	6
El Palomar	-34.62	-58.60	AR	6
Qiryat Ata	32.81	35.11	IL	6
Acará	-1.96	-48.20	BR	6
Royal Oak	42.49	-83.14	US	6
Minami-Sōma	37.63	140.98	JP	6
Camacupa	-12.02	17.48	AO	6
Mot’a	11.08	37.87	ET	6
Slutsk	53.02	27.54	BY	6
Gola Gokarannāth	28.08	80.47	IN	6
Mbera	15.86	-5.79	MR	6
Zarand	30.81	56.56	IR	6
Petroúpolis	38.04	23.68	GR	6
Stralsund	54.31	13.08	DE	6
Goz Beida	12.23	21.41	TD	6
Gohad	26.43	78.44	IN	6
Golpāyegān	33.45	50.29	IR	6
Torbat-e Jām	35.24	60.62	IR	6
Fraijanes	14.47	-90.44	GT	6
Kitahiroshima	42.98	141.57	JP	6
Mpanda	-3.17	29.40	BI	6
Cruz Alta	-28.64	-53.61	BR	6
Xiaoweizhai	26.19	107.51	CN	6
Baki	-7.61	110.78	ID	6
Cerro de Pasco	-10.67	-76.25	PE	6
Mikhaylovka	50.06	43.23	RU	6
Solnechnogorsk	56.18	36.97	RU	6
Villach	46.61	13.86	AT	6
Antu	43.10	128.91	CN	6
Bañga	6.42	124.78	PH	6
Benalmádena	36.60	-4.57	ES	6
Wani	20.06	78.95	IN	6
Ardakān	32.31	54.02	IR	6
Menzel Bourguiba	37.15	9.79	TN	6
Dubuque	42.50	-90.66	US	6
Wallasey	53.42	-3.06	GB	6
Kamphaeng Phet	16.48	99.52	TH	6
Comayagua	14.46	-87.64	HN	6
Thiruvarur	10.77	79.64	IN	6
Upleta	21.74	70.28	IN	6
Suozhen	36.95	118.10	CN	6
Ishikari	43.24	141.35	JP	6
Tessaoua	13.76	7.99	NE	6
Cerdanyola del Vallès	41.49	2.14	ES	6
Vinto	-17.39	-66.32	BO	6
Kayes	-4.20	13.29	CG	6
Marseille 12	43.30	5.44	FR	6
Brookline	42.33	-71.12	US	6
Novi	42.48	-83.48	US	6
Jaguariúna	-22.71	-46.99	BR	6
Littlehampton	50.81	-0.54	GB	6
Er Roseires	11.87	34.39	SD	6
Tokoname	34.88	136.85	JP	6
Arsen’yev	44.16	133.27	RU	6
Shwegu	24.23	96.79	MM	6
Viseu	-1.20	-46.14	BR	6
Hanyū	36.17	139.53	JP	6
Ṣāleḥīeh	35.51	51.19	IR	6
Des Plaines	42.03	-87.88	US	6
Beliatta	6.05	80.73	LK	6
Kampong Dungun	3.22	101.32	MY	6
Hameln	52.10	9.36	DE	6
Carrara	44.08	10.10	IT	6
Taifu	28.98	105.64	CN	6
Los Patios	7.84	-72.50	CO	6
Mnihla	36.85	10.11	TN	6
Carson City	39.16	-119.77	US	6
Padangpanjang	-0.46	100.41	ID	6
Orland Park	41.63	-87.85	US	6
San Pedro Ayampuc	14.78	-90.45	GT	6
Oumé	6.38	-5.42	CI	6
Mpondwe	0.04	29.72	UG	6
Nūzvīd	16.79	80.85	IN	6
Frutal	-20.02	-48.94	BR	6
Ngã Năm	9.57	105.60	VN	6
Bartlett	35.20	-89.87	US	6
Glogovac	42.63	20.89	XK	6
Beitbridge	-22.22	30.00	ZW	6
Guerara	32.79	4.50	DZ	6
Toki	35.35	137.18	JP	6
Woodland	38.68	-121.77	US	6
Lonavla	18.75	73.41	IN	6
Loum	4.72	9.74	CM	6
Shiqiaozi	36.16	119.26	CN	6
Una	20.82	71.04	IN	6
Jidong	45.26	131.12	CN	6
São Gabriel	-30.34	-54.32	BR	6
Lehi	40.39	-111.85	US	6
Dom Eliseu	-4.29	-47.51	BR	6
Ouled Djellal	34.43	5.06	DZ	6
Fenyi	27.81	114.67	CN	6
Racibórz	50.09	18.22	PL	6
White Plains	41.03	-73.76	US	6
Uzlovaya	53.98	38.16	RU	6
Paombong	14.83	120.79	PH	6
Weleri	-6.97	110.07	ID	6
Chonglong	29.78	104.85	CN	6
Xinglongshan	43.96	125.47	CN	6
Choshi	35.73	140.83	JP	6
San Pedro de Jujuy	-24.23	-64.87	AR	6
Al Ḩāmūl	31.31	31.15	EG	6
Fort Beaufort	-32.77	26.63	ZA	6
Benevento	41.13	14.78	IT	6
Trairi	-3.28	-39.27	BR	6
Arcadia	34.14	-118.04	US	6
Reston	38.97	-77.34	US	6
Friedrichshafen	47.66	9.48	DE	6
Batatais	-20.89	-47.59	BR	6
Finote Selam	10.70	37.27	ET	6
Barkam	31.90	102.22	CN	6
Sakurai	34.50	135.85	JP	6
Chaiyaphum	15.81	102.03	TH	6
Shibuzi	36.12	119.10	CN	6
Uttaradit	17.63	100.09	TH	6
Lixian	34.19	105.17	CN	6
Murakami	38.23	139.48	JP	6
Larbaâ	36.56	3.15	DZ	6
Hongqiao	26.77	112.11	CN	6
Sérres	41.08	23.55	GR	6
Antsalova	-18.67	44.62	MG	6
Trenčín	48.89	18.04	SK	6
Changbai	41.42	128.20	CN	6
Zhutuo	29.02	105.85	CN	6
Korçë	40.62	20.78	AL	6
San Andrés	12.58	-81.70	CO	6
Patzún	14.68	-91.01	GT	6
Będzin	50.33	19.13	PL	6
Sillod	20.30	75.65	IN	6
Kırklareli	41.74	27.23	TR	6
Colón	-32.22	-58.14	AR	6
Ocala	29.19	-82.14	US	6
Kisela Voda	41.95	21.50	MK	6
Nikšić	42.77	18.94	ME	6
Dingtao	35.07	115.57	CN	6
Clay	43.19	-76.17	US	6
Myaungmya	16.60	94.92	MM	6
Omoa	15.78	-88.04	HN	6
Dongxi	28.76	106.66	CN	6
Los Dos Caminos	10.49	-66.83	VE	6
Arzew	35.85	-0.32	DZ	6
Petauke	-14.24	31.32	ZM	6
Kanbe	16.71	96.00	MM	6
Täby	59.44	18.07	SE	6
South Vineland	39.45	-75.03	US	6
Lorient	47.75	-3.37	FR	6
Sanford	28.80	-81.27	US	6
Juye	35.39	116.07	CN	6
Ekangala	-25.67	28.73	ZA	6
Nahariyya	33.01	35.10	IL	6
Dapaong	10.86	0.21	TG	6
Felgueiras	41.37	-8.19	PT	6
Serian	1.17	110.57	MY	6
Streatham	51.43	-0.13	GB	6
Hancheng	35.46	110.43	CN	6
Göppingen	48.70	9.65	DE	6
Zgierz	51.86	19.41	PL	6
Caucasia	7.99	-75.19	CO	6
Bowie	38.94	-76.73	US	6
Simpang Empat	4.95	100.63	MY	6
Port Coquitlam	49.27	-122.77	CA	6
Santangpu	27.41	111.99	CN	6
Invercargill	-46.40	168.35	NZ	6
Volzhsk	55.87	48.36	RU	6
Kokomo	40.49	-86.13	US	6
Chornomors’k	46.30	30.66	UA	6
Sarcelles	49.00	2.38	FR	6
Jatiwangi	-6.73	108.26	ID	6
Acámbaro	20.03	-100.72	MX	6
Vigevano	45.31	8.85	IT	6
Kawthoung	9.98	98.55	MM	6
Pessac	44.81	-0.63	FR	6
Imarichō-kō	33.27	129.88	JP	6
Magsaysay	6.77	125.18	PH	6
Santa Rosa de Cabal	4.87	-75.62	CO	6
Sīra	13.74	76.90	IN	6
Baekrajan	-6.77	110.85	ID	6
Wayne	40.93	-74.28	US	6
Kraaifontein	-33.85	18.72	ZA	6
Hardenberg	52.58	6.62	NL	6
Ivry-sur-Seine	48.82	2.38	FR	6
Kokubu-matsuki	31.73	130.77	JP	6
San Francisco El Alto	14.94	-91.44	GT	6
Chikhli	20.35	76.26	IN	6
Veles	41.72	21.77	MK	6
Al Wāsiţah	29.34	31.21	EG	6
Tabaco	13.36	123.73	PH	6
Jing'an	34.50	116.92	CN	6
Pianura	40.86	14.17	IT	6
Kogalym	62.27	74.48	RU	6
Jhārgrām	22.45	86.99	IN	6
Évreux	49.02	1.15	FR	6
Bootle	53.47	-3.02	GB	6
Santee	32.84	-116.97	US	6
Emin	46.53	83.63	CN	6
Ponte Nova	-20.42	-42.91	BR	6
Orito	0.67	-76.87	CO	6
Longtan	28.76	108.96	CN	6
Shenliu	29.41	112.16	CN	6
Lop Buri	14.80	100.65	TH	6
Manicoré	-5.81	-61.30	BR	6
Ksar	18.10	-15.96	MR	6
Görlitz	51.16	14.99	DE	6
Dublin	37.70	-121.94	US	6
St. Albert	53.63	-113.64	CA	6
Hagere Maryam	5.63	38.24	ET	6
Stolberg	50.77	6.23	DE	6
Ash Shāmīyah	31.96	44.60	IQ	6
Ávila	40.66	-4.70	ES	6
Maocun	34.38	117.25	CN	6
Mongaguá	-24.09	-46.62	BR	6
Harsīn	34.27	47.59	IR	6
Sundsvall	62.39	17.31	SE	6
Bebington	53.35	-3.02	GB	6
El Hatillo	10.42	-66.83	VE	6
Legnano	45.60	8.92	IT	6
Vénissieux	45.70	4.89	FR	6
Kagaznāgār	19.33	79.47	IN	6
Cergy	49.04	2.08	FR	6
Ālbū Kamāl	34.45	40.92	SY	6
Trảng Bom	10.95	107.01	VN	6
Ban Pong	13.82	99.88	TH	6
Krymsk	44.93	37.99	RU	6
Huangpi	30.88	114.38	CN	6
Shanhecun	45.71	128.58	CN	6
Biała Podlaska	52.03	23.12	PL	6
Bhātāpāra	21.73	81.95	IN	6
Yantongshan	43.29	126.01	CN	6
Kāsībugga	18.76	84.42	IN	6
Guarabira	-6.85	-35.49	BR	6
Hasanpur	28.72	78.28	IN	6
Clichy	48.90	2.31	FR	6
Na Di	14.12	101.78	TH	6
Guiren	33.67	118.19	CN	6
Chongwe	-15.33	28.68	ZM	6
Maulavi Bāzār	24.49	91.77	BD	6
Palm Harbor	28.08	-82.76	US	6
Kan’onjichō	34.13	133.65	JP	6
Santo Tomas	14.11	121.14	PH	6
Linares	38.10	-3.64	ES	6
Lohārdagā	23.43	84.68	IN	6
Kentau	43.52	68.50	KZ	6
Marinilla	6.17	-75.34	CO	6
Kidderminster	52.39	-2.25	GB	6
Myaydo	19.37	95.22	MM	6
Cheremkhovo	53.15	103.08	RU	6
Morley	53.74	-1.60	GB	6
Jahāngīrābād	28.41	78.11	IN	6
Sherkot	29.33	78.57	IN	6
Siu Lek Yuen	22.38	114.21	HK	6
Kātrās	23.80	86.30	IN	6
El Menia	30.58	2.88	DZ	6
Minbu	20.18	94.88	MM	6
Zhongxing	33.70	118.68	CN	6
Halabja	35.18	45.99	IQ	6
Talagante	-33.66	-70.93	CL	6
Langxiang	46.95	128.87	CN	6
Kaffrine	14.11	-15.55	SN	6
Catacaos	-5.27	-80.68	PE	6
Garoowe	8.40	48.48	SO	6
Kota Sambas	1.36	109.30	ID	6
Mācherla	16.48	79.44	IN	6
Naksalbāri	26.68	88.22	IN	6
Sankarankovil	9.17	77.54	IN	6
Mulbāgal	13.16	78.39	IN	6
Paris 09 Opéra	48.87	2.34	FR	6
Kolaboui	10.80	-14.40	GN	6
Midwest City	35.45	-97.40	US	6
Kandukūr	15.22	79.90	IN	6
Nonoichi	36.53	136.62	JP	6
Margate	26.24	-80.21	US	6
Tiruvalla	9.38	76.57	IN	6
Roshanpura	28.60	76.99	IN	6
Villa Hayes	-25.09	-57.53	PY	6
Thanbyuzayat	15.97	97.73	MM	6
Bergama	39.12	27.18	TR	6
Ponnūru	16.07	80.55	IN	6
Boufarik	36.57	2.91	DZ	6
Chitral	35.85	71.79	PK	6
South Whittier	33.95	-118.04	US	6
Bageqi	37.14	79.84	CN	6
Saint-André	-20.96	55.65	RE	6
Kollegāl	12.15	77.11	IN	6
Tinley Park	41.57	-87.78	US	6
Hamada	34.88	132.08	JP	6
Mukandpur	28.74	77.18	IN	6
Bandō	36.07	139.87	JP	6
Anamur	36.08	32.84	TR	6
Suiling	47.23	127.11	CN	6
Pflugerville	30.44	-97.62	US	6
Mafraq	32.34	36.21	JO	6
Wenxing	28.68	112.88	CN	6
Unjha	23.80	72.39	IN	6
Frankfurt (Oder)	52.35	14.55	DE	6
Fichē	9.80	38.73	ET	6
Zhigulëvsk	53.40	49.51	RU	6
Yingli	37.06	118.81	CN	6
Sakaidechō	34.32	133.84	JP	6
Kāmyārān	34.80	46.94	IR	6
Chhibrāmau	27.15	79.50	IN	6
Borūjen	31.97	51.29	IR	6
As Sawānī	32.72	13.07	LY	6
Tilhar	27.96	79.74	IN	6
Dehdasht	30.79	50.57	IR	6
New Brunswick	40.49	-74.45	US	6
Annaka	36.33	138.90	JP	6
Lunglei	22.89	92.74	IN	6
Jahangira	33.96	72.22	PK	6
Grand Forks	47.93	-97.03	US	6
Emmen	52.78	6.91	NL	6
Phra Phutthabat	14.73	100.80	TH	6
Reyhanlı	36.27	36.57	TR	6
Baishishan	43.58	127.57	CN	6
Fountain Valley	33.71	-117.95	US	6
Hoskote	13.07	77.80	IN	6
Hendala	6.99	79.88	LK	6
Haripur	34.00	72.93	PK	6
Minokamo	35.48	137.02	JP	6
Roslavl’	53.95	32.86	RU	6
Stourbridge	52.46	-2.14	GB	6
Byasanagar	20.96	86.13	IN	6
Manfredonia	41.63	15.92	IT	6
Veszprém	47.09	17.91	HU	6
Anlong Veaeng	14.23	104.08	KH	6
Bayt Lāhyā	31.55	34.50	PS	6
Foligno	42.95	12.70	IT	6
Zhuzhai	34.76	116.81	CN	6
Purbalingga	-7.39	109.36	ID	6
Xam Nua	20.42	104.05	LA	6
Diamond Bar	34.03	-117.81	US	6
Kitgum	3.28	32.89	UG	6
Baden-Baden	48.76	8.24	DE	6
Ipirá	-12.16	-39.74	BR	6
Bada Barabīl	22.11	85.39	IN	6
Hattingen	51.40	7.19	DE	6
Sāmalkot	17.06	82.18	IN	6
Caacupé	-25.39	-57.14	PY	6
Mukō	34.97	135.70	JP	6
Karīmganj	24.87	92.36	IN	6
Livingston	55.90	-3.52	GB	6
Umm Ruwaba	12.91	31.22	SD	6
Ushuaia	-54.81	-68.32	AR	6
Nōgata	33.74	130.72	JP	6
Bobbili	18.57	83.36	IN	6
Jinji	23.23	110.83	CN	6
Fana	12.78	-6.96	ML	6
Marseille 11	43.29	5.44	FR	6
Taunton	41.90	-71.09	US	6
Fussa	35.74	139.32	JP	6
Ambalangoda	6.24	80.05	LK	6
Batac City	18.06	120.56	PH	6
Oak Lawn	41.71	-87.76	US	6
Union	40.70	-74.26	US	6
Ankeny	41.73	-93.61	US	6
Battir	31.70	35.12	PS	6
Malārd	35.67	50.98	IR	6
Weining	26.85	104.23	CN	6
Mettur	11.79	77.80	IN	6
Chicopee	42.15	-72.61	US	6
Sattenapalle	16.39	80.15	IN	6
San Vicent del Raspeig	38.40	-0.53	ES	6
Castlereagh	54.57	-5.88	GB	6
Kettering	52.40	-0.73	GB	6
Morondava	-20.29	44.32	MG	6
Paudalho	-7.90	-35.18	BR	6
Qingfu	28.44	104.52	CN	6
Jamrud	34.00	71.38	PK	6
Daokou	35.57	114.52	CN	6
Okcheon	36.30	127.57	KR	6
Tirūrangādi	11.04	75.92	IN	6
Yashan	22.20	109.94	CN	6
Woluwe-Saint-Lambert	50.84	4.43	BE	6
Lingayen	16.02	120.23	PH	6
Masinloc	15.54	119.95	PH	6
Borovichi	58.39	33.92	RU	6
Hilden	51.17	6.93	DE	6
Wellingborough	52.30	-0.69	GB	6
Tennala	10.99	75.94	IN	6
Aylmer	45.40	-75.81	CA	6
Chakradharpur	22.68	85.63	IN	6
Oberá	-27.49	-55.12	AR	6
Dörtyol	36.84	36.23	TR	6
Limoeiro	-7.87	-35.45	BR	6
Ureña	7.92	-72.44	VE	6
Capitão Poço	-1.75	-47.06	BR	6
Açu	-5.58	-36.91	BR	6
Sendhwa	21.69	75.10	IN	6
Nantai	40.92	122.80	CN	6
Sukuta	13.41	-16.71	GM	6
Balai Pungut	1.06	101.29	ID	6
Talegaon Dābhāde	18.74	73.68	IN	6
Potenza	40.64	15.81	IT	6
Changleng	28.70	115.82	CN	6
Saint-Michel	45.57	-73.62	CA	6
Hiriyūr	13.94	76.62	IN	6
São Gabriel da Cachoeira	-0.12	-67.09	BR	6
Rolim de Moura	-11.80	-61.80	BR	6
Chino	35.99	138.15	JP	6
Mocoa	1.15	-76.65	CO	6
Boudouaou	36.73	3.41	DZ	6
Mizuho	35.39	136.67	JP	6
Anjangaon	21.17	77.31	IN	6
Mon Repos	10.28	-61.45	TT	6
Hutang	31.53	119.49	CN	6
Pul-e Khumrī	35.94	68.72	AF	6
Berwyn	41.85	-87.79	US	6
Sanchuan	26.75	100.66	CN	6
Charkhi Dādri	28.59	76.27	IN	6
Châu Phong	10.72	105.13	VN	6
Caleta Olivia	-46.45	-67.52	AR	6
Ujhāni	28.00	79.01	IN	6
Honiara	-9.43	159.95	SB	6
Fier	40.73	19.56	AL	6
Sitou	36.31	118.41	CN	6
Kaédi	16.15	-13.51	MR	6
Bankra	22.60	88.28	IN	6
Mendaha	-1.02	103.59	ID	6
Forest	50.82	4.33	BE	6
Dabhoi	22.18	73.43	IN	6
Kūt-e ‘Abdollāh	31.24	48.66	IR	6
Zibihu	26.11	99.95	CN	6
Mutsu	41.29	141.22	JP	6
Teghra	25.49	85.94	IN	6
Baidi	31.06	109.59	CN	6
Sleman	-7.72	110.36	ID	6
Gaogou	34.02	119.19	CN	6
Espinal	4.15	-74.88	CO	6
Huauchinango	20.17	-98.05	MX	6
Vranje	42.55	21.90	RS	6
Kirishi	59.47	32.04	RU	6
Gölcük	40.72	29.82	TR	6
Khartsyzk	48.04	38.14	UA	6
Linghai	41.17	121.37	CN	6
Turbaco	10.33	-75.41	CO	6
Dongola	19.18	30.48	SD	6
Paita	-5.09	-81.11	PE	6
Kendale Lakes	25.71	-80.41	US	6
Smyrna	33.88	-84.51	US	6
Dearborn Heights	42.34	-83.27	US	6
Longshi	30.21	106.46	CN	6
Hermanus	-34.42	19.23	ZA	6
Moncalieri	45.00	7.68	IT	6
Ródos	36.44	28.22	GR	6
Obra	24.42	82.99	IN	6
Umm el Faḥm	32.52	35.15	IL	6
Kobo	10.03	39.85	ET	6
Xuzhuang	34.30	117.46	CN	6
Sankt Augustin	50.78	7.20	DE	6
Ayapel	8.31	-75.14	CO	6
Tiruvallur	13.14	79.91	IN	6
Mandapeta	16.86	81.93	IN	6
Kutu	-2.72	18.15	CD	6
Tirur	10.91	75.92	IN	6
Porterville	36.07	-119.02	US	6
Kimilili	0.79	34.72	KE	6
Piscataway	40.50	-74.40	US	6
Kandi	11.13	2.94	BJ	6
Pandak	-7.91	110.29	ID	6
Ropar	30.97	76.53	IN	6
Gongyi	34.76	113.01	CN	6
Al Badārī	26.99	31.42	EG	6
Hendersonville	36.30	-86.62	US	6
Roeselare	50.95	3.12	BE	6
Melo	-32.37	-54.16	UY	6
Santo Amaro	-12.55	-38.71	BR	6
Papatoetoe	-36.97	174.84	NZ	6
Eisen	35.97	128.93	KR	6
Dangila	11.27	36.83	ET	6
Bonga	7.29	36.24	ET	6
Kapenguria	1.24	35.11	KE	6
Ezhva	61.81	50.73	RU	6
Nāmakkal	11.22	78.17	IN	6
Toumodi	6.56	-5.02	CI	6
Cuneo	44.39	7.55	IT	6
Qinnan	33.25	119.91	CN	6
Barabai	-2.58	115.38	ID	6
Arcot	12.91	79.32	IN	6
Liski	50.98	39.50	RU	6
Gelan	30.04	107.12	CN	6
Zvyahel	50.59	27.61	UA	6
Lāharpur	27.71	80.90	IN	6
Impasugong	8.31	125.00	PH	6
Trần Văn Thời	9.08	104.98	VN	6
Kudamatsu	34.01	131.87	JP	6
Kuala Selangor	3.35	101.25	MY	6
Vryburg	-26.96	24.73	ZA	6
Bolvadin	38.71	31.05	TR	6
Dalianwan	39.03	121.69	CN	6
Changling	44.27	123.98	CN	6
Marechal Cândido Rondon	-24.56	-54.06	BR	6
Chumphon	10.50	99.18	TH	6
Mozambique	-15.03	40.73	MZ	6
Tirhanimîne	35.24	-3.95	MA	6
Viramgām	23.13	72.05	IN	6
Zarrīn Shahr	32.39	51.38	IR	6
San Rafael	10.96	-71.73	VE	6
Rocky Mount	35.94	-77.79	US	6
Corvallis	44.56	-123.26	US	6
Eschweiler	50.82	6.27	DE	6
Berrouaghia	36.14	2.91	DZ	6
Tsévié	6.43	1.21	TG	6
Ełk	53.83	22.36	PL	6
San Antonio	-25.42	-57.55	PY	6
Aïn Touta	35.38	5.90	DZ	6
Olympia	47.04	-122.90	US	6
Valdosta	30.83	-83.28	US	6
Asadābād	34.78	48.12	IR	6
Islāmpur	26.27	88.19	IN	6
Bonan	25.46	99.53	CN	6
Zile	40.30	35.89	TR	6
Serowe	-22.39	26.71	BW	6
Dibaya-Lubwe	-4.16	19.86	CD	6
Karād	17.29	74.18	IN	6
Hanford	36.33	-119.65	US	6
Kampung Bukit Baharu	2.22	102.29	MY	6
Kawm Ḩamādah	30.76	30.70	EG	6
Lubao	14.94	120.60	PH	6
Shibirghān	36.67	65.75	AF	6
Hashtgerd	35.96	50.68	IR	6
'Ārdamatā	13.48	22.49	SD	6
My Drarga	30.38	-9.47	MA	6
Zhuyi	31.03	109.39	CN	6
Yanam	16.73	82.21	IN	6
Klaeng	12.78	101.65	TH	6
Pirapora	-17.34	-44.94	BR	6
Świętochłowice	50.30	18.92	PL	6
Rumonge	-3.97	29.44	BI	6
Ābu Road	24.48	72.78	IN	6
Yongqing	34.75	106.13	CN	6
Castle Rock	39.37	-104.86	US	6
Linqiong	30.42	103.46	CN	6
Snizhne	48.02	38.76	UA	6
Greenwood	39.61	-86.11	US	6
Takizawa	39.80	141.13	JP	6
Brazlândia	-15.68	-48.20	BR	6
At Tall	33.61	36.31	SY	6
Amuntai	-2.42	115.25	ID	6
Hà Giang	22.82	104.98	VN	6
Nuevo Casas Grandes	30.42	-107.91	MX	6
Hempstead	40.71	-73.62	US	6
Buthidaung Town	20.88	92.53	MM	6
Wellington	-33.64	19.01	ZA	6
Raxaul	26.98	84.85	IN	6
Moonniyur	11.06	75.90	IN	6
Novato	38.11	-122.57	US	6
Kettering	39.69	-84.17	US	6
Tlokweng	-24.67	25.97	BW	6
Barwāni	22.03	74.90	IN	6
Qishan	29.84	117.72	CN	6
Vyaz’ma	55.21	34.30	RU	6
Buriticupu	-4.32	-46.45	BR	6
Barrow in Furness	54.11	-3.23	GB	6
Videira	-27.01	-51.15	BR	6
Besuki	-7.73	113.70	ID	6
Rîbniţa	47.77	29.01	MD	6
Aurora	44.00	-79.47	CA	6
Lanshan	33.94	117.72	CN	6
Mangina	0.60	29.31	CD	6
Shoreline	47.76	-122.34	US	6
Luau	-10.71	22.22	AO	6
Oued Rhiou	35.96	0.92	DZ	6
Anjiang	27.32	110.10	CN	6
San Fernando	10.28	-61.47	TT	6
Xinqing	48.29	129.52	CN	6
Gapyeong	37.83	127.51	KR	6
Ksar Hellal	35.65	10.89	TN	6
Paramount	33.89	-118.16	US	6
Beledweyne	4.74	45.20	SO	6
Placetas	22.31	-79.65	CU	6
Saint-Quentin	49.85	3.29	FR	6
Mpulungu	-8.76	31.11	ZM	6
Tønsberg	59.27	10.41	NO	6
Bisceglie	41.24	16.50	IT	6
Kottayam	9.59	76.52	IN	6
Pruszków	52.17	20.81	PL	6
Bozüyük	39.91	30.04	TR	6
Tiruttangal	9.48	77.83	IN	6
Minamiuonuma	37.08	138.87	JP	6
Bossangoa	6.49	17.46	CF	6
Taliwang	-8.74	116.85	ID	6
Port Arthur	29.89	-93.94	US	6
Petlād	22.48	72.80	IN	6
Dorbod	46.86	124.44	CN	6
Sesvete	45.83	16.12	HR	6
Yutan	28.26	112.56	CN	6
Abington	40.12	-75.12	US	6
Anderson	40.11	-85.68	US	6
Wedi	-7.74	110.58	ID	6
Jālaun	26.15	79.34	IN	6
Ahu	34.38	118.60	CN	6
Pátzcuaro	19.51	-101.61	MX	6
Torrelavega	43.35	-4.05	ES	6
Hidaka	35.92	139.36	JP	6
Moreno	-8.12	-35.09	BR	6
Mafra	-26.11	-49.81	BR	6
Satte	36.07	139.73	JP	6
Djemmal	35.62	10.76	TN	6
Periya Semūr	11.36	77.69	IN	6
Ahlen	51.76	7.89	DE	6
Tamiami	25.76	-80.40	US	6
Aïn Defla	36.26	1.97	DZ	6
Três Pontas	-21.37	-45.51	BR	6
Kas	12.51	24.29	SD	6
Paris 05 Panthéon	48.84	2.35	FR	6
Nazarovo	56.01	90.42	RU	6
Hulu Langat	3.11	101.81	MY	6
Rubizhne	49.01	38.38	UA	6
Villa Bruzual	9.33	-69.12	VE	6
Rāmganj	23.10	90.85	BD	6
Madhupur	24.27	86.64	IN	6
Dhūri	30.37	75.87	IN	6
Pazardzhik	42.20	24.33	BG	6
Klimovsk	55.36	37.53	RU	6
South Croydon	51.36	-0.09	GB	6
Towson	39.40	-76.60	US	6
Naic	14.32	120.77	PH	6
Challakere	14.32	76.65	IN	6
Bayan	46.08	127.39	CN	6
Etāwa	24.18	78.20	IN	6
Zouérat	22.74	-12.47	MR	6
North Chicopee	42.18	-72.60	US	6
Shijōnawate	34.73	135.68	JP	6
Elda	38.48	-0.79	ES	6
Paraíso do Tocantins	-10.18	-48.87	BR	6
Drean	36.68	7.75	DZ	6
Licha	36.06	119.78	CN	6
Pingjin	30.61	107.54	CN	6
Chiplūn	17.53	73.51	IN	6
Cần Giờ	10.41	106.95	VN	6
Mandlā	22.60	80.37	IN	6
Biel/Bienne	47.14	7.25	CH	6
Sarasota	27.34	-82.53	US	6
Šabac	44.75	19.69	RS	6
Narail	23.16	89.50	BD	6
Kalasin	16.43	103.51	TH	6
Lesnoy	57.62	63.08	RU	6
Canterbury	51.28	1.08	GB	6
Bhīmunipatnam	17.89	83.45	IN	6
Olímpia	-20.74	-48.91	BR	6
Eqbālīyeh	36.23	49.92	IR	6
Cepu	-7.15	111.59	ID	6
Kaga-Bandoro	6.99	19.19	CF	6
União da Vitória	-26.23	-51.09	BR	6
Luang Prabang	19.89	102.15	LA	6
Sharifabad	33.43	73.36	PK	6
Canoinhas	-26.18	-50.39	BR	6
Mawlai-Mawïong	25.62	91.88	IN	6
Cuango-Luzamba	-9.15	18.04	AO	6
Caxito	-8.58	13.66	AO	6
Shilin	24.82	103.33	CN	6
Jinotega	13.09	-86.00	NI	6
Berëzovskiy	55.67	86.27	RU	6
Waterloo	8.34	-13.07	SL	6
Dunfermline	56.07	-3.46	GB	6
Dompu	-8.54	118.46	ID	6
Kavanur	13.00	80.08	IN	6
Reghaïa	36.74	3.34	DZ	6
Liguo	34.55	117.33	CN	6
Huangnihe	43.56	128.02	CN	6
Viljoenskroon	-27.21	26.95	ZA	6
Tallang-dong	33.49	126.48	KR	6
Saint-Jérôme	45.78	-74.00	CA	6
West Haven	41.27	-72.95	US	6
Miyakojima	24.79	125.31	JP	6
Rosemead	34.08	-118.07	US	6
Sabinas	27.86	-101.12	MX	6
Bad Salzuflen	52.09	8.74	DE	6
Cuenca	40.07	-2.13	ES	6
Euskirchen	50.66	6.79	DE	6
Estancia	11.46	123.15	PH	6
Yecheon	36.66	128.46	KR	6
Pithāpuram	17.12	82.25	IN	6
Al Khafjī	28.44	48.49	SA	6
Highland	34.13	-117.21	US	6
Kāndi	23.96	88.04	IN	6
San José de las Lajas	22.96	-82.15	CU	6
Jelgava	56.65	23.71	LV	6
Mamoudzou	-12.78	45.23	YT	6
Meerbusch	51.25	6.69	DE	6
Sangarédi	11.10	-13.77	GN	6
Idappadi	11.59	77.84	IN	6
Manzhouli	49.60	117.43	CN	6
Caaguazú	-25.47	-56.02	PY	6
Pontes e Lacerda	-15.23	-59.34	BR	6
Huguo	28.59	105.37	CN	6
Liuji	34.36	117.05	CN	6
Asenovgrad	42.02	24.87	BG	6
Sāhibābād Daulotpur	28.75	77.11	IN	6
Bandar Labuan	5.28	115.25	MY	6
Mount Prospect	42.07	-87.94	US	6
Punganūru	13.37	78.57	IN	6
Liangzhai	34.50	116.75	CN	6
Wolfenbüttel	52.16	10.54	DE	6
Huyton	53.41	-2.84	GB	6
Bhamo	24.25	97.23	MM	6
Rio de Mouro	38.77	-9.33	PT	6
Liaozhong	41.51	122.72	CN	6
Hürth	50.87	6.87	DE	6
Luputa	-7.16	23.70	CD	6
Barry	51.40	-3.28	GB	6
Odienné	9.51	-7.56	CI	6
San Josecito	7.66	-72.22	VE	6
Boghni	36.54	3.95	DZ	6
Niort	46.32	-0.46	FR	6
Ghātāl	22.66	87.73	IN	6
Burauen	10.98	124.89	PH	6
Odivelas	38.79	-9.18	PT	6
Hamura	35.76	139.32	JP	6
Colton	34.07	-117.31	US	6
San Marcos	13.66	-89.18	SV	6
Sibonga	10.02	123.62	PH	6
Konan	35.00	136.10	JP	6
Palmares	-8.68	-35.59	BR	6
Wangji	33.98	117.75	CN	6
Belfort	47.64	6.85	FR	6
Giurgiu	43.89	25.96	RO	6
Sāgar	14.16	75.03	IN	6
Sihor	21.71	71.96	IN	6
Huacho	-11.12	-77.61	PE	6
Mūndka	28.68	77.03	IN	6
Al Mayādīn	35.02	40.45	SY	6
Belorechensk	44.77	39.87	RU	6
El Banco	9.00	-73.98	CO	6
San Bernardino Tlaxcalancingo	19.03	-98.28	MX	6
Himimachi	36.86	136.99	JP	6
Dumyāţ al Jadīdah	31.43	31.68	EG	6
Bafang	5.16	10.18	CM	6
Chelghoum el Aïd	36.16	6.17	DZ	6
Deglur	18.55	77.58	IN	6
Meikle Earnock	55.75	-4.03	GB	6
Hamilton	55.77	-4.03	GB	6
Madhepura	25.92	86.79	IN	6
Modica	36.86	14.76	IT	6
Nanzhou	29.36	112.41	CN	6
Pocatello	42.87	-112.45	US	6
Bradenton	27.50	-82.57	US	6
Buíque	-8.62	-37.16	BR	6
Pirojpur	22.58	89.98	BD	6
Swedru	5.54	-0.70	GH	6
Bukit Tengah	5.35	100.44	MY	6
Bārāmati	18.15	74.58	IN	6
Mahāsamund	21.11	82.09	IN	6
Narva	59.38	28.19	EE	6
Jinka	5.65	36.65	ET	6
Nelson	-41.27	173.28	NZ	6
Ain El Aouda	33.80	-6.79	MA	6
Xóm Cái Nước	9.80	105.10	VN	6
Weymouth	42.22	-70.94	US	6
Sittingbourne	51.34	0.73	GB	6
Port Charlotte	26.98	-82.09	US	6
Tramandaí	-29.98	-50.13	BR	6
Tharyarwady	17.65	95.79	MM	6
Yunjin	29.08	105.64	CN	6
Normal	40.51	-88.99	US	6
Medianeira	-25.30	-54.09	BR	6
Ajaccio	41.92	8.74	FR	6
Jagüey Grande	22.53	-81.13	CU	6
Javānrūd	34.81	46.49	IR	6
Eisenzicken	47.28	16.26	AT	6
Macclesfield	53.26	-2.13	GB	6
Az̧ Z̧a‘āyin	25.58	51.48	QA	6
Teramo	42.66	13.70	IT	6
Bahlā’	22.98	57.30	OM	6
Sidhi	24.40	81.88	IN	6
Luojing	31.48	121.34	CN	6
Krasnokamensk	50.09	118.03	RU	6
Guapimirim	-22.54	-42.98	BR	6
Spring	30.08	-95.42	US	6
Presidente Franco	-25.56	-54.61	PY	6
Allapattah	25.81	-80.22	US	6
Okaya	36.06	138.05	JP	6
Durbanville	-33.83	18.65	ZA	6
Dullewala	31.83	71.44	PK	6
Kérou	10.83	2.10	BJ	6
Pir Jo Goth	27.59	68.62	PK	6
Gravesend	51.44	0.37	GB	6
Pemangkat	1.17	108.97	ID	6
Richland	46.29	-119.28	US	6
Eastleigh	50.97	-1.35	GB	6
Zinacantepec	19.28	-99.73	MX	6
Euless	32.84	-97.08	US	6
Sau Mau Ping	22.32	114.23	HK	6
Eldorado	-26.40	-54.62	AR	6
Kāsaragod	12.50	74.99	IN	6
Garhchiroli	20.18	80.01	IN	6
Blue Springs	39.02	-94.28	US	6
Cajicá	4.92	-74.03	CO	6
Koumra	8.92	17.55	TD	6
East Pensacola Heights	30.43	-87.18	US	6
Kalamata	37.04	22.11	GR	6
As Sāḩil	27.06	31.34	EG	6
Puttūr	13.44	79.55	IN	6
Diffa	13.32	12.61	NE	6
Jalor	25.35	72.62	IN	6
Nirgua	10.15	-68.56	VE	6
Samāna	30.15	76.20	IN	6
Bangassou	4.74	22.82	CF	6
Cerignola	41.27	15.90	IT	6
Aranjuez	40.03	-3.60	ES	6
Rāzampeta	14.20	79.16	IN	6
Wāri	21.15	79.01	IN	6
Chilanga Township	-15.57	28.27	ZM	6
Kwaggafontein	-25.33	28.94	ZA	6
Shella	25.18	91.64	IN	6
Hacienda Heights	33.99	-117.97	US	6
Fangcun	34.09	117.47	CN	6
Palmaner	13.20	78.75	IN	6
Xihu	23.96	120.48	TW	6
Kavála	40.94	24.41	GR	6
Deolāli	19.94	73.83	IN	6
Lozova	48.89	36.31	UA	6
Nuevitas	21.54	-77.26	CU	6
Suzaka	36.65	138.32	JP	6
Vannes	47.66	-2.76	FR	6
Kanakapura	12.55	77.42	IN	6
Schweinfurt	50.05	10.22	DE	6
Ribeira do Pombal	-10.83	-38.54	BR	6
Wokha	26.10	94.26	IN	6
Neustadt an der Weinstraße	49.35	8.14	DE	6
Trani	41.28	16.41	IT	6
Sartrouville	48.95	2.19	FR	6
Druzhkivka	48.62	37.53	UA	6
Umred	20.85	79.32	IN	6
Şabbāshahr	35.58	51.11	IR	6
Yongjian	25.43	100.21	CN	6
Bandar-e Torkaman	36.90	54.07	IR	6
Iwade	34.25	135.32	JP	6
Maisons-Alfort	48.81	2.44	FR	6
Kālna	23.22	88.36	IN	6
Huesca	42.14	-0.41	ES	6
Barbosa	6.44	-75.33	CO	6
Timashyovsk	45.62	38.95	RU	6
Saint-Louis	-21.29	55.41	RE	6
Mingcun	36.75	119.64	CN	6
Severomorsk	69.07	33.41	RU	6
Pandamaran	3.01	101.42	MY	6
Phong Thạnh	9.32	105.35	VN	6
Chaniá	35.51	24.03	GR	6
Siena	43.32	11.33	IT	6
Mondlo	-27.98	30.72	ZA	6
Domodedovo	55.44	37.75	RU	6
Chenārān	36.65	59.12	IR	6
Eger	47.90	20.37	HU	6
Pallichal	8.45	77.03	IN	6
Jacona de Plancarte	19.96	-102.31	MX	6
Pīshvā	35.31	51.73	IR	6
Tāndoni	10.93	78.09	IN	6
Pārvatipuram	18.78	83.43	IN	6
Lingcheng	33.82	118.11	CN	6
Cathedral City	33.78	-116.47	US	6
Meaux	48.96	2.88	FR	6
Kericho	-0.37	35.28	KE	6
Portici	40.82	14.34	IT	6
Vyshniy Volochëk	57.59	34.57	RU	6
Kotharia	22.23	70.82	IN	6
Ottapalam	10.77	76.38	IN	6
Al Ibrāhīmīyah	30.72	31.56	EG	6
Kurihama	35.23	139.70	JP	6
Elyria	41.37	-82.11	US	6
Mongo	12.19	18.69	TD	6
Pulheim	51.00	6.81	DE	6
Bỉm Sơn	20.08	105.86	VN	6
Dīdwāna	27.40	74.58	IN	6
Jardines de la Silla	25.63	-100.19	MX	6
Ostrołęka	53.09	21.58	PL	6
Starachowice	51.04	21.07	PL	6
Markala	13.68	-6.07	ML	6
Pensacola	30.42	-87.22	US	6
Wheaton	41.87	-88.11	US	6
Kintampo	8.06	-1.73	GH	6
Mercedes	14.11	123.01	PH	6
Assi Bou Nif	35.69	-0.50	DZ	6
Commerce City	39.81	-104.93	US	6
Santiago Teyahualco	19.66	-99.12	MX	6
Begampur	28.73	77.07	IN	6
Charikar	35.01	69.17	AF	6
Arao	32.98	130.45	JP	6
Jinding	26.44	99.44	CN	6
Blois	47.59	1.33	FR	6
Smethwick	52.49	-1.97	GB	6
Al Marāghah	26.70	31.60	EG	6
Safaga	26.75	33.94	EG	6
Hoboken	40.74	-74.03	US	6
Watsonville	36.91	-121.76	US	6
Kongoussi	13.33	-1.53	BF	6
Gaddi Annaram	17.37	78.52	IN	6
Coatepec	19.45	-96.96	MX	6
Dumraon	25.55	84.15	IN	6
Anapa	44.89	37.32	RU	6
El Kef	36.17	8.70	TN	6
Évora	38.57	-7.90	PT	6
Frýdek-Místek	49.68	18.35	CZ	6
San Bartolomé de Tirajana	27.92	-15.57	ES	6
Pamplona	7.38	-72.65	CO	6
Nerupperichchal	11.16	77.37	IN	6
Ercolano	40.81	14.35	IT	6
Goshogawara	40.80	140.44	JP	6
Nihommatsu	37.58	140.43	JP	6
Lake Havasu City	34.48	-114.32	US	6
Qingxichang	28.40	108.90	CN	6
Papantla de Olarte	20.45	-97.32	MX	6
Jaggaiahpet	16.89	80.10	IN	6
Hvidovre	55.64	12.48	DK	6
Les Abymes	16.27	-61.51	GP	6
Buguruslan	53.66	52.44	RU	6
El Viejo	12.66	-87.17	NI	6
Inada	36.43	140.52	JP	6
Menemen	38.61	27.07	TR	6
Extrema	-22.85	-46.32	BR	6
Braintree	51.88	0.55	GB	6
Ilo	-17.63	-71.34	PE	6
Buzhuang	36.91	119.56	CN	6
Rampur Hat	24.18	87.78	IN	6
Brive-la-Gaillarde	45.16	1.53	FR	6
Chystyakove	48.04	38.60	UA	6
Klinteby Frihed	55.20	11.60	DK	6
Avedøre	55.63	12.46	DK	6
Khanapuram Haveli	17.26	80.17	IN	6
Arles	43.68	4.63	FR	6
Goālpāra	26.18	90.63	IN	6
Little Havana	25.77	-80.23	US	6
Tuni	17.36	82.55	IN	6
Shiquan	33.04	108.24	CN	6
Revere	42.41	-71.01	US	6
Yangtun	34.88	116.88	CN	6
Weymouth	50.61	-2.46	GB	6
Porto Feliz	-23.21	-47.52	BR	6
Chortoq	41.07	71.82	UZ	6
Suphan Buri	14.47	100.12	TH	6
Beauvais	49.43	2.08	FR	6
Laxmangarh	27.82	75.03	IN	6
São Miguel dos Campos	-9.78	-36.09	BR	6
Río Tercero	-32.18	-64.11	AR	6
Zhangfeng	24.19	97.80	CN	6
Shāhpur	16.70	76.84	IN	6
West New York	40.79	-74.01	US	6
Itabirito	-20.25	-43.80	BR	6
Tutóia	-2.76	-42.27	BR	6
Los Polvorines	-34.50	-58.71	AR	6
Voi	-3.40	38.56	KE	6
Granja	-3.12	-40.83	BR	6
Bhongīr	17.52	78.89	IN	6
Chaozhou	22.55	120.54	TW	6
Tōkamachi	37.13	138.77	JP	6
Chaeryŏng-ŭp	38.40	125.62	KP	6
Yucaipa	34.03	-117.04	US	6
Châteauroux	46.81	1.69	FR	6
São Tomé	0.34	6.73	ST	6
Sri Dūngargarh	28.10	74.01	IN	6
Kateríni	40.27	22.51	GR	6
Ayodhya	26.80	82.20	IN	6
Natitingou	10.30	1.38	BJ	6
Montesilvano	42.51	14.15	IT	6
Sampang	-7.19	113.24	ID	6
Mubarakpur	26.09	83.29	IN	6
Pathum Wan	13.74	100.52	TH	6
Taquara	-29.65	-50.78	BR	6
Ōami	35.52	140.32	JP	6
Yousuo	26.03	100.07	CN	6
Amalāpuram	16.58	82.01	IN	6
Gilroy	37.01	-121.57	US	6
Tomé	-36.62	-72.96	CL	6
Hell-Ville	-13.40	48.27	MG	6
Arsikere	13.31	76.26	IN	6
Fryazevo	55.73	38.46	RU	6
Phaltan	17.99	74.43	IN	6
Kabale	-1.25	29.99	UG	6
Zhaozhuang	34.74	116.46	CN	6
Poinciana	28.14	-81.46	US	6
Ashta	23.02	76.72	IN	6
Sandīla	27.07	80.51	IN	6
Tingo María	-9.30	-76.00	PE	6
Santa Isabel	-23.32	-46.22	BR	6
Silivri	41.07	28.25	TR	6
Cholet	47.06	-0.88	FR	6
Novena	1.32	103.84	SG	6
Zawiercie	50.49	19.42	PL	6
Artur Nogueira	-22.57	-47.17	BR	6
Ar Rastan	34.93	36.73	SY	6
Sinan	34.83	126.11	KR	6
Bagheria	38.08	13.51	IT	6
Rondon do Pará	-4.78	-48.07	BR	6
Vikārābād	17.34	77.90	IN	6
Naka	36.05	140.17	JP	6
Gummersbach	51.03	7.56	DE	6
Cava Dè Tirreni	40.70	14.71	IT	6
Baruipur	22.37	88.43	IN	6
Rioverde	21.93	-99.99	MX	6
Tanjungagung	-3.94	103.80	ID	6
Beberibe	-4.18	-38.13	BR	6
Oosterhout	51.65	4.86	NL	6
Gulariyā	28.21	81.35	NP	6
Banes	20.96	-75.72	CU	6
Miryang	35.49	128.75	KR	6
Fréjus	43.43	6.74	FR	6
Zaragoza	15.45	120.80	PH	6
Butterworth	-32.33	28.15	ZA	6
Al Sajaah	25.32	55.63	AE	6
Lahbab	25.04	55.59	AE	6
‘Izbat ‘Alī as Sayyid	31.16	30.15	EG	6
Thái Bình	20.45	106.34	VN	6
Hatogaya-honchō	35.83	139.74	JP	6
Ciudad de Huajuapan de León	17.81	-97.78	MX	6
Mediaş	46.17	24.35	RO	6
Khanzhonkivskyi	48.10	38.04	UA	6
Ben Jerrar	30.26	-9.50	MA	6
Bartolomé Masó	20.17	-76.94	CU	6
Bitlis	38.40	42.11	TR	6
Kingsport	36.55	-82.56	US	6
Swakopmund	-22.68	14.53	NA	6
Choudwar	20.54	85.92	IN	6
Tangzhang	34.15	117.25	CN	6
Levittown	40.16	-74.83	US	6
Alexandroupoli	40.85	25.88	GR	6
Aversa	40.97	14.21	IT	6
Piedade	-23.71	-47.43	BR	6
Waiblingen	48.83	9.32	DE	6
Nueva Guinea	11.69	-84.46	NI	6
Palm Beach Gardens	26.82	-80.14	US	6
Pantin	48.89	2.41	FR	6
Velletri	41.69	12.78	IT	6
Tha Maka	13.90	99.77	TH	6
São Miguel do Guamá	-1.63	-47.48	BR	6
Xinguara	-7.10	-49.94	BR	6
Sultānganj	25.24	86.74	IN	6
Congonhas	-20.51	-43.86	BR	6
Enerhodar	47.49	34.66	UA	6
Patuto	14.12	120.97	PH	6
Mandi Dabwāli	29.97	74.70	IN	6
Tân Uyên	11.08	106.79	VN	6
Buseresere	-3.05	31.89	TZ	6
Lingwu	38.10	106.34	CN	6
Taoyuan	33.85	117.77	CN	6
'Alī Ābād-e Katūl	36.91	54.87	IR	6
Imara Daima Estate	-1.32	36.88	KE	6
Verviers	50.59	5.86	BE	6
Bordj el Bahri	36.79	3.25	DZ	6
San José del Guaviare	2.57	-72.64	CO	6
Delmiro Gouveia	-9.39	-38.00	BR	6
Nordhorn	52.43	7.07	DE	6
Cocorote	10.32	-68.78	VE	6
Āgaro	7.85	36.65	ET	6
Port Shepstone	-30.74	30.45	ZA	6
Adilcevaz	38.80	42.73	TR	6
Trichardt	-26.49	29.23	ZA	6
Saint-Brieuc	48.52	-2.77	FR	6
Konch	25.99	79.15	IN	6
São Francisco	-15.95	-44.86	BR	6
Milford	41.22	-73.06	US	6
Beisu	38.15	114.81	CN	6
Bandar-e Genāveh	29.58	50.52	IR	6
Cửa Nam	21.02	105.85	VN	6
Bāprola	28.64	77.01	IN	6
Kota Tinggi	1.74	103.90	MY	6
Delano	35.77	-119.25	US	6
Colcapirhua	-17.39	-66.24	BO	6
Universitäts- und Hansestadt Greifswald	54.09	13.40	DE	6
West Sacramento	38.58	-121.53	US	6
Wulingyuan	29.35	110.54	CN	6
Malingshan	34.20	118.36	CN	6
Yartsevo	55.06	32.70	RU	6
Huntersville	35.41	-80.84	US	6
Pabbi	34.01	71.79	PK	6
Krasnokamsk	58.08	55.76	RU	6
Venkatagiri	13.96	79.58	IN	6
Ergani	38.27	39.75	TR	6
Perth Amboy	40.51	-74.27	US	6
Río Grande	-53.79	-67.71	AR	6
Cuxhaven	53.87	8.70	DE	6
São Francisco do Sul	-26.24	-48.64	BR	6
Ridder	50.35	83.52	KZ	6
Shiogama	38.32	141.03	JP	6
Hualong	36.95	118.59	CN	6
Wetzlar	50.56	8.50	DE	6
Porto Ferreira	-21.85	-47.48	BR	6
Bau	1.42	110.15	MY	6
Palapye	-22.55	27.13	BW	6
Boadilla del Monte	40.41	-3.88	ES	6
Ålesund	62.47	6.15	NO	6
Kahnūj	27.94	57.70	IR	6
Utrera	37.19	-5.78	ES	6
Dianbu	36.70	120.35	CN	6
Ţūkh	30.35	31.20	EG	6
Zabīd	14.20	43.32	YE	6
Southaven	34.99	-90.01	US	6
Brentwood	51.62	0.31	GB	6
Niono	14.25	-5.99	ML	6
Imbituba	-28.24	-48.67	BR	6
Dabhel	20.41	72.88	IN	6
Amora	38.63	-9.12	PT	6
Saint Peters	38.80	-90.63	US	6
Terbanggi Besar	-4.88	105.22	ID	6
Maiquetía	10.59	-66.96	VE	6
Puji	36.13	119.72	CN	6
Downtown DC	38.89	-77.02	US	6
Caucagüito	10.49	-66.74	VE	6
Pryluky	50.60	32.38	UA	6
Lalian	31.82	72.80	PK	6
Harrisonburg	38.45	-78.87	US	6
Corroios	38.64	-9.15	PT	6
Biswān	27.50	81.00	IN	6
Peabody	42.53	-70.93	US	6
Lautoka	-17.62	177.45	FJ	6
Thongwa	16.76	96.52	MM	6
Qabula	30.18	73.07	PK	6
Placentia	33.87	-117.87	US	6
Jaén	-5.71	-78.81	PE	6
Siruguppa	15.63	76.89	IN	6
Kosi	27.79	77.44	IN	6
Jette	50.87	4.33	BE	6
Lenexa	38.95	-94.73	US	6
DeSoto	32.59	-96.86	US	6
Mollet del Vallès	41.54	2.21	ES	6
Pursat	12.54	103.92	KH	6
Pir Mahal	30.77	72.43	PK	6
Ciudad Bolivia	8.35	-70.57	VE	6
Burlington	36.10	-79.44	US	6
Sironj	24.10	77.69	IN	6
Nametil	-15.72	39.34	MZ	6
Menden	51.44	7.78	DE	6
Montauban	44.02	1.35	FR	6
Tomiya	38.39	140.89	JP	6
South Hill	47.14	-122.27	US	6
Kyaiklat	16.45	95.72	MM	6
Tarhuna	32.44	13.63	LY	6
Charleville-Mézières	49.77	4.72	FR	6
Albi	43.93	2.15	FR	6
Campos do Jordão	-22.74	-45.59	BR	6
Al ‘Azīzīyah	32.53	13.02	LY	6
Xingqiao	30.40	120.25	CN	6
Jangaon	17.73	79.15	IN	6
Esher	51.37	-0.37	GB	6
Ivato	-18.80	47.48	MG	6
Mithi	24.74	69.80	PK	6
Daudnagar	25.03	84.40	IN	6
Zalău	47.20	23.05	RO	6
Hannan	34.33	135.25	JP	6
Elkhart	41.68	-85.98	US	6
Bergkamen	51.62	7.64	DE	6
Kamifukuoka	35.87	139.51	JP	6
Frechen	50.91	6.81	DE	6
Óbidos	-1.92	-55.52	BR	6
La Crosse	43.80	-91.24	US	6
Chagni	10.96	36.50	ET	6
Eilat	29.56	34.95	IL	6
Dandeli	15.27	74.62	IN	6
Ramapuram	13.03	80.18	IN	6
Welland	42.98	-79.25	CA	6
Plottier	-38.97	-68.23	AR	6
Oak Park	41.89	-87.78	US	6
Mansoûra	34.86	-1.34	DZ	6
Ponticelli	40.85	14.33	IT	6
Noshiro	40.21	140.03	JP	6
Campo Belo	-20.90	-45.28	BR	6
Songlingcun	40.29	118.27	CN	6
Santo Estêvão	-12.43	-39.25	BR	6
Tengréla	10.48	-6.41	CI	6
Florissant	38.79	-90.32	US	6
Taquaritinga	-21.41	-48.50	BR	6
Kalamansig	6.55	124.05	PH	6
Fryazino	55.96	38.05	RU	6
Sammamish	47.64	-122.08	US	6
Yunshan	36.82	120.23	CN	6
Maluñgun	6.28	125.28	PH	6
Kakata	6.53	-10.35	LR	6
Kobryn	52.21	24.36	BY	6
Matamoros	25.53	-103.23	MX	6
Hervey Bay	-25.29	152.77	AU	6
Cangandala	-9.78	16.43	AO	6
Pula	44.87	13.85	HR	6
Dapeng	34.28	117.08	CN	6
Victoria	13.18	121.28	PH	6
Sanzhuang	35.50	119.17	CN	6
Shiraoka	36.02	139.66	JP	6
Zarinsk	53.71	84.94	RU	6
São José do Rio Pardo	-21.60	-46.89	BR	6
Inhumas	-16.36	-49.50	BR	6
Sé	22.19	113.55	MO	6
Matilda Estate	1.40	103.90	SG	6
Tres Arroyos	-38.38	-60.28	AR	6
Mudhol	16.33	75.28	IN	6
Ban Talat Yai	7.88	98.40	TH	6
Erbaa	40.67	36.57	TR	6
Tavşanlı	39.54	29.50	TR	6
Arandas	20.71	-102.35	MX	6
Zhawa	37.21	79.63	CN	6
Sandwīp	22.51	91.45	BD	6
Antratsyt	48.12	39.09	UA	6
Jitai	36.76	118.74	CN	6
Ban Lak Song	13.69	100.40	TH	6
Hoffman Estates	42.04	-88.08	US	6
Nyagan	62.14	65.39	RU	6
Sar-e Pul	36.22	65.93	AF	6
Ad Darwa	33.37	-7.54	MA	6
Tarbes	43.23	0.07	FR	6
Dobo	-5.76	134.23	ID	6
Fontenay-sous-Bois	48.85	2.48	FR	6
Kimry	56.87	37.36	RU	6
Mouscron	50.74	3.21	BE	6
Ar Riqqah	29.15	48.09	KW	6
Ta Khmau	11.48	104.95	KH	6
Zizhuang	34.36	117.49	CN	6
Parobé	-29.63	-50.83	BR	6
Liangji	33.96	117.97	CN	6
Chake Chake	-5.25	39.77	TZ	6
Thodupuzha	9.89	76.72	IN	6
Methuen	42.73	-71.19	US	6
Kirumba	-1.09	29.29	CD	6
Thomazeau	18.65	-72.09	HT	6
Caetité	-14.07	-42.48	BR	6
Glendora	34.14	-117.87	US	6
Lamía	38.90	22.43	GR	6
Sātkania	22.08	92.05	BD	6
Jūrmala	56.97	23.77	LV	6
Mokolo	10.74	13.80	CM	6
Huamantla	19.31	-97.93	MX	6
Ānwén	29.06	120.44	CN	6
Al Aaroui	35.01	-3.01	MA	6
Dunstable	51.89	-0.52	GB	6
Ciudad Piar	7.45	-63.32	VE	6
Port Macquarie	-31.43	152.91	AU	6
Nioro	15.23	-9.59	ML	6
Kepanjen	-8.13	112.57	ID	6
San Severo	41.69	15.38	IT	6
Dashahe	34.54	116.62	CN	6
Roskilde	55.64	12.08	DK	6
Gjilan	42.46	21.47	XK	6
Usulután	13.34	-88.44	SV	6
Brookhaven	33.86	-84.34	US	6
Évry	48.63	2.44	FR	6
Thị Trấn Phước Bửu	10.53	107.40	VN	6
Duzhou	29.88	107.08	CN	6
Corralillo	22.98	-80.59	CU	6
Meybod	32.25	54.02	IR	6
Secondigliano	40.90	14.27	IT	6
Sa'dah	16.94	43.76	YE	6
Palm Desert	33.72	-116.38	US	6
Zhongxin	26.62	101.27	CN	6
Devakottai	9.95	78.82	IN	6
Bad Homburg vor der Höhe	50.23	8.62	DE	6
Porvoo	60.39	25.67	FI	6
Arwal	25.24	84.67	IN	6
Louveira	-23.09	-46.95	BR	6
Willich	51.26	6.55	DE	6
Puertollano	38.69	-4.11	ES	6
Ostuncalco	14.87	-91.62	GT	6
Weimiao	34.58	117.07	CN	6
Joplin	37.08	-94.51	US	6
Blora	-6.97	111.42	ID	6
Boundiali	9.52	-6.49	CI	6
Mahdia	35.50	11.06	TN	6
Orhangazi	40.49	29.31	TR	6
Coruripe	-10.13	-36.18	BR	6
Baljurashi	19.86	41.56	SA	6
Enid	36.40	-97.88	US	6
Calvià	39.57	2.51	ES	6
Tiu Keng Leng	22.30	114.25	HK	6
Lower Sackville	44.78	-63.68	CA	6
Kāliyāganj	25.63	88.33	IN	6
Nasīrābād	26.30	74.73	IN	6
Mampong	7.06	-1.40	GH	6
Léo	11.10	-2.11	BF	6
Saint John’s	17.12	-61.84	AG	6
Bom Despacho	-19.74	-45.25	BR	6
Ijebu-Jesa	7.68	4.82	NG	6
Wanguru	-0.68	37.36	KE	6
Vidnoye	55.55	37.71	RU	6
Qoryooley	1.79	44.53	SO	6
Bonita Springs	26.34	-81.78	US	6
São Lourenço	22.19	113.53	CN	6
Kasba Tadla	32.60	-6.27	MA	6
Irondequoit	43.21	-77.58	US	6
Zepu	38.19	77.27	CN	6
Yeonggwang	35.28	126.51	KR	6
Caldwell	43.66	-116.69	US	6
Segovia	40.95	-4.12	ES	6
Minnetonka	44.91	-93.50	US	6
En Nedjma	35.65	-0.57	DZ	6
Mikkeli	61.69	27.27	FI	6
Bitonto	41.11	16.69	IT	6
Liuquan	34.43	117.30	CN	6
Futtsu	35.31	139.82	JP	6
Morecambe	54.07	-2.86	GB	6
Baião	-2.79	-49.67	BR	6
Shahr-e Bābak	30.12	55.12	IR	6
Pinellas Park	27.84	-82.70	US	6
Tagawa	33.63	130.80	JP	6
Xanxerê	-26.88	-52.40	BR	6
Ibiporã	-23.27	-51.05	BR	6
Tijucas	-27.24	-48.63	BR	6
Battle Creek	42.32	-85.18	US	6
Maha Sarakham	16.18	103.30	TH	6
Khagaul	25.58	85.05	IN	6
Yeongam	34.80	126.70	KR	6
Redhill	51.24	-0.17	GB	6
Barinitas	8.76	-70.41	VE	6
Tachilek	20.45	99.88	MM	6
Takāb	36.40	47.11	IR	6
Mazara del Vallo	37.66	12.59	IT	6
Emden	53.37	7.21	DE	6
Welwyn Garden City	51.80	-0.21	GB	6
Cardona	14.49	121.23	PH	6
Sado	38.02	138.36	JP	6
Arganda	40.30	-3.44	ES	6
Miura	35.14	139.62	JP	6
Agustín Codazzi	10.04	-73.24	CO	6
Zhefang	24.27	98.28	CN	6
Horsham	51.06	-0.33	GB	6
Casa Grande	32.88	-111.76	US	6
Ksar Chellala	35.21	2.32	DZ	6
The Villages	28.93	-81.96	US	6
Grand Island	40.93	-98.34	US	6
Sūsangerd	31.56	48.19	IR	6
Changanācheri	9.44	76.54	IN	6
Acre	32.93	35.08	IL	6
Đố Sơn	20.71	106.79	VN	6
Sanhui	30.08	106.59	CN	6
Lagoa da Prata	-20.02	-45.54	BR	6
Jendouba	36.50	8.78	TN	6
Grapevine	32.93	-97.08	US	6
Clamart	48.80	2.27	FR	6
Tŭytepa	41.03	69.36	UZ	6
Shorāpur	16.52	76.76	IN	6
Neu-Ulm	48.39	10.01	DE	6
Bol	13.47	14.71	TD	6
Stratford	41.18	-73.13	US	6
Uriangato	20.14	-101.18	MX	6
Quíbor	9.93	-69.62	VE	6
Māndvi	22.83	69.35	IN	6
El Nido	11.19	119.40	PH	6
Rajgangpur	22.20	84.58	IN	6
Patiya	22.30	91.98	BD	6
Kentwood	42.87	-85.64	US	6
Kangāvar	34.50	47.97	IR	6
Morrinhos	-17.73	-49.10	BR	6
Tarma	-11.42	-75.69	PE	6
Nkowakowa	-23.89	30.29	ZA	6
Chautārā	27.78	85.71	NP	6
Gopālganj	23.22	90.06	BD	6
Tulun	54.57	100.58	RU	6
Lingen	52.52	7.33	DE	6
Samfya	-11.36	29.56	ZM	6
Sapé	-7.10	-35.23	BR	6
Marseille 10	43.28	5.42	FR	6
Venice	45.44	12.33	IT	6
Ozar	20.09	73.93	IN	6
Coronel Oviedo	-25.45	-56.44	PY	6
Balţīm	31.56	31.09	EG	6
Barreiro	38.66	-9.07	PT	6
Peranāmpattu	12.93	78.72	IN	6
City of Milford (balance)	41.22	-73.06	US	6
Dianzi	36.90	119.87	CN	6
Gumlā	23.04	84.54	IN	6
Châlons-en-Champagne	48.95	4.37	FR	6
Teoloyucan	19.74	-99.18	MX	6
Tigard	45.43	-122.77	US	6
East Hartford	41.78	-72.61	US	6
Rāmnagar	29.39	79.13	IN	6
Vazhakkala	10.01	76.33	IN	6
Nichinan	31.60	131.37	JP	6
Dartford	51.45	0.21	GB	6
Siocon	7.71	122.14	PH	6
Phra Nakhon	13.77	100.50	TH	6
Kabbasin	36.43	37.57	SY	6
Shujālpur	23.41	76.71	IN	6
Plainfield	40.63	-74.41	US	6
Susono	35.17	138.91	JP	6
Qulsary	46.95	54.02	KZ	6
Leesburg	39.12	-77.56	US	6
Erftstadt	50.81	6.79	DE	6
Aïn Oulmene	35.92	5.30	DZ	6
Bejaâd	32.77	-6.39	MA	6
Kapchorwa	1.40	34.45	UG	6
Tirumangalam	9.82	77.98	IN	6
Krujë	41.51	19.79	AL	6
Panlong	29.50	105.37	CN	6
Tremembé	-22.96	-45.55	BR	6
Sidlaghatta	13.39	77.86	IN	6
El Bagre	7.60	-74.81	CO	6
Miyako	39.65	141.94	JP	6
Leopoldina	-21.53	-42.64	BR	6
Parsippany	40.86	-74.43	US	6
Martin	49.07	18.92	SK	6
Musina	-22.35	30.04	ZA	6
Coral Gables	25.72	-80.27	US	6
Gangshang	34.52	118.12	CN	6
Neubrück	51.13	6.64	DE	6
Khurai	24.04	78.33	IN	6
Brejo da Madre de Deus	-8.15	-36.37	BR	6
Kayna	-0.61	29.17	CD	6
Barra	-11.09	-43.14	BR	6
Comal	-6.91	109.53	ID	6
Brejo Santo	-7.49	-38.99	BR	6
Seydişehir	37.42	31.85	TR	6
Guanshan	33.80	117.87	CN	6
Ivanteyevka	55.97	37.92	RU	6
Puerto Berrío	6.49	-74.40	CO	6
The Trails of Frisco	33.16	-96.87	US	6
Hilsa	25.32	85.28	IN	6
Sidi Taibi	34.19	-6.68	MA	6
Staines	51.43	-0.51	GB	6
Hikari	33.95	131.95	JP	6
Khalkhāl	37.62	48.53	IR	6
Rampura Phul	30.28	75.24	IN	6
Kot Mumin	32.19	73.03	PK	6
Tadmur	34.56	38.28	SY	6
Pom Prap Sattru Phai	13.76	100.51	TH	6
The Hammocks	25.67	-80.44	US	6
Jesús Menéndez	21.16	-76.48	CU	6
Ţarīf Kalbā	25.07	56.33	AE	6
Bunawan	8.17	125.99	PH	6
Ubauro	28.16	69.73	PK	6
Gostivar	41.80	20.91	MK	6
Fatwa	25.51	85.31	IN	6
Gombong	-7.61	109.51	ID	6
Tūndla	27.21	78.24	IN	6
Acayucan	17.95	-94.91	MX	6
Żoliborz	52.27	20.99	PL	6
Az̧ Z̧ulayl	32.12	36.28	JO	6
Birkat as Sab‘	30.63	31.08	EG	6
Royal Leamington Spa	52.29	-1.52	GB	6
Mannārakkāt	10.99	76.46	IN	6
Shuijiang	29.25	107.28	CN	6
Teplice	50.64	13.82	CZ	6
Guaxupé	-21.31	-46.71	BR	6
Tobias Barreto	-11.18	-38.00	BR	6
Metpalle	18.85	78.63	IN	6
Whangarei	-35.73	174.32	NZ	6
Kosonsoy	41.25	71.55	UZ	6
Gurlan	41.84	60.39	UZ	6
Cimitarra	6.31	-73.95	CO	6
Juruti	-2.15	-56.09	BR	6
Babīlā	33.47	36.33	SY	6
Hà Đông	20.97	105.78	VN	6
Buckeye	33.37	-112.58	US	6
Naya Gaon	30.78	76.79	IN	6
Repalle	16.02	80.83	IN	6
Hunsūr	12.30	76.29	IN	6
Kyōtango	35.61	135.04	JP	6
Vittoria	36.95	14.53	IT	6
Donetsk	48.34	39.95	RU	6
Tocumen	9.09	-79.38	PA	6
Flagami	25.76	-80.32	US	6
Vigia	-0.86	-48.14	BR	6
Phra Nakhon Si Ayutthaya	14.35	100.58	TH	6
Guanzhuang	36.26	119.19	CN	6
Barranqueras	-27.48	-58.94	AR	6
Catalina Foothills	32.30	-110.92	US	6
Boende	-0.28	20.88	CD	6
Salo	60.38	23.13	FI	6
Legionowo	52.40	20.93	PL	6
Yerba Buena	-26.81	-65.30	AR	6
Narbonne	43.18	3.00	FR	6
Lahr	48.34	7.87	DE	6
Padang Serai	5.51	100.55	MY	6
Fuchūchō	34.57	133.24	JP	6
Chinú	9.11	-75.40	CO	6
Belleville	44.17	-77.38	CA	6
Gelendzhik	44.58	38.07	RU	6
Hinckley	52.54	-1.38	GB	6
Yasu	35.10	136.02	JP	6
Rajanpur	29.10	70.33	PK	6
Mao	14.12	15.31	TD	6
Manaung	18.85	93.73	MM	6
Saint-Malo	48.65	-2.01	FR	6
Sidikalang	2.75	98.31	ID	6
Oshnavīyeh	37.04	45.10	IR	6
Merzifon	40.87	35.46	TR	6
Phetchabun	16.42	101.16	TH	6
Adenta	5.71	-0.15	GH	6
Al Ḩusaynīyah	30.86	31.92	EG	6
Yūki	36.30	139.88	JP	6
Lytkarino	55.58	37.91	RU	6
Shanji	34.20	117.60	CN	6
Sangkapura	-5.85	112.65	ID	6
Suhum	6.04	-0.45	GH	6
Saint Croix	17.73	-64.75	VI	6
Nanjangūd	12.12	76.68	IN	6
Lhünzhub	29.89	91.26	CN	6
Skien	59.21	9.61	NO	6
Ōi	35.85	139.52	JP	6
Jaru	-10.44	-62.47	BR	6
Ibbenbueren	52.28	7.71	DE	6
Vila-real	39.94	-0.10	ES	6
Tolga	34.72	5.38	DZ	6
Kingisepp	59.38	28.61	RU	6
Herning	56.14	8.98	DK	6
Kizlyar	43.85	46.71	RU	6
Passau	48.57	13.43	DE	6
Abovyan	40.27	44.63	AM	6
Pèlèngana	13.43	-6.22	ML	6
El Negrito	15.32	-87.70	HN	6
Clacton-on-Sea	51.79	1.16	GB	6
Gronau	52.21	7.02	DE	6
Kawalu	-7.38	108.21	ID	6
Zhob	31.34	69.45	PK	6
Cumbernauld	55.95	-3.99	GB	6
Khorramdarreh	36.21	49.20	IR	6
Turbo	8.09	-76.73	CO	6
Kavaklı	41.09	28.33	TR	6
Deçan	42.54	20.29	XK	6
Laval	48.07	-0.77	FR	6
Hyères	43.12	6.13	FR	6
Kyaukse	21.61	96.14	MM	6
Amahai	-3.34	128.92	ID	6
Forbesganj	26.30	87.27	IN	6
Cần Đước	10.51	106.60	VN	6
North La Crosse	43.85	-91.25	US	6
Burien	47.47	-122.35	US	6
Nithari	28.70	77.05	IN	6
Ambatondrazaka	-17.83	48.42	MG	6
Tarnobrzeg	50.57	21.68	PL	6
Çarşamba	41.20	36.72	TR	6
Naviraí	-23.07	-54.19	BR	6
Tafo	6.73	-1.61	GH	6
Tūyserkān	34.55	48.44	IR	6
Hanyuan	32.83	106.25	CN	6
Langenhagen	52.45	9.74	DE	6
Gallarate	45.66	8.79	IT	6
Havertown	39.98	-75.31	US	6
Vargem Grande Paulista	-23.60	-47.03	BR	6
Boa Viagem	-5.13	-39.73	BR	6
Arjona	10.25	-75.34	CO	6
San Mateo	10.21	-67.42	VE	6
Bindura	-17.30	31.33	ZW	6
Schwerte	51.44	7.57	DE	6
Taxco de Alarcón	18.55	-99.61	MX	6
Matli	25.04	68.66	PK	6
North Bay	46.32	-79.47	CA	6
Tubod	8.06	123.79	PH	6
Sunabeda	18.73	82.83	IN	6
Gajraula	28.85	78.24	IN	6
Logan	41.74	-111.83	US	6
Kirkcaldy	56.12	-3.16	GB	6
Khagrachhari	23.11	91.97	BD	6
Ness Ziona	31.93	34.80	IL	6
Ma'an	30.20	35.73	JO	6
Speyer	49.32	8.43	DE	6
Saint-Hyacinthe	45.63	-72.96	CA	6
Mochudi	-24.42	26.15	BW	6
Jahanian	30.04	71.82	PK	6
Modimolle	-24.70	28.40	ZA	6
Torbalı	38.18	27.34	TR	6
Vīrapāndi	11.06	77.35	IN	6
Sek’ot’a	12.63	39.03	ET	6
Nanao	37.05	136.97	JP	6
South Peabody	42.51	-70.95	US	6
Dāhānu	19.97	72.71	IN	6
Rovigo	45.07	11.79	IT	6
Asakura	33.41	130.72	JP	6
Midori	36.44	139.28	JP	6
Rasipuram	11.46	78.19	IN	6
Al Khābūrah	23.97	57.09	OM	6
Saint-Gilles	50.83	4.34	BE	6
La Calera	-32.79	-71.20	CL	6
Sālūr	18.52	83.21	IN	6
Chusovoy	58.29	57.81	RU	6
Anju	39.62	125.66	KP	6
Aliso Viejo	33.57	-117.73	US	6
Bletchley	51.99	-0.73	GB	6
Harrisburg	40.27	-76.88	US	6
Galveston	29.30	-94.80	US	6
Bhabhua	25.04	83.61	IN	6
Yeovil	50.94	-2.63	GB	6
Keighley	53.87	-1.91	GB	6
Mui Ne	10.93	108.28	VN	6
Mellit	14.13	25.55	SD	6
Kasaoka	34.51	133.50	JP	6
Kotka	60.47	26.95	FI	6
Poway	32.96	-117.04	US	6
Hodal	27.89	77.37	IN	6
Edina	44.89	-93.35	US	6
Monapo	-14.92	40.30	MZ	6
Otradnyy	53.38	51.35	RU	6
Minnetonka Mills	44.94	-93.44	US	6
Balayan	13.94	120.73	PH	6
Déressia	9.76	16.27	TD	6
Katanawa	33.52	130.42	JP	6
Zacapu	19.82	-101.79	MX	6
Jihlava	49.40	15.59	CZ	6
Fungurume	-10.62	26.32	CD	6
Bhadrāchalam	17.67	80.89	IN	6
Snezhinsk	56.08	60.75	RU	6
Dunaújváros	46.96	18.94	HU	6
Nanjian	25.04	100.51	CN	6
Uiju	40.20	124.53	KP	6
Sfântu Gheorghe	45.87	25.78	RO	6
Pijijiapan	15.69	-93.21	MX	6
Moyobamba	-6.03	-76.97	PE	6
Capivari	-23.00	-47.51	BR	6
Heidenheim an der Brenz	48.68	10.15	DE	6
Tateyama	34.98	139.87	JP	6
Jatiroto	-7.88	111.12	ID	6
Kibaigwa	-6.08	36.65	TZ	6
Dogondoutchi	13.64	4.03	NE	6
Campo Novo do Parecis	-13.68	-57.89	BR	6
Mairinque	-23.55	-47.18	BR	6
Naxi	28.77	105.36	CN	6
Zhenxi	29.90	107.46	CN	6
Bījār	35.87	47.61	IR	6
Aonla	28.27	79.17	IN	6
Ali Sabih	11.16	42.71	DJ	6
Tirupparangunram	9.88	78.07	IN	6
Andulo	-11.49	16.70	AO	6
Samara	11.79	41.01	ET	6
LOHAS Park	22.29	114.27	HK	6
Al-Hamdaniya	36.27	43.38	IQ	6
Arashiyama	35.01	135.68	JP	6
Aarsâl	34.18	36.42	LB	6
Ghazieh	33.52	35.37	LB	6
Hpa-An	16.89	97.63	MM	6
Putrajaya	2.94	101.69	MY	6
Sri Petaling	3.07	101.69	MY	6
Taman Melati	3.22	101.72	MY	6
Kuchai Lama	3.08	101.69	MY	6
Tipitapa	12.20	-86.10	NI	6
Juigalpa	12.11	-85.37	NI	6
Ciudad Sandino	12.16	-86.34	NI	6
Rawalakot	33.86	73.76	PK	6
Buni	36.27	72.26	PK	6
Monsanto	39.46	-8.71	PT	6
‘Ayn al ‘Arab	36.89	38.35	SY	6
Ko Samui	9.54	99.94	TH	6
Utengule	-8.90	33.33	TZ	6
Tukuyu	-9.25	33.65	TZ	6
Masumbwe	-3.63	32.18	TZ	6
Merelani	-3.56	36.98	TZ	6
Stonecrest	33.71	-84.13	US	6
Vinhomes Smart City	21.00	105.74	VN	6
Vinhomes Times City	20.99	105.87	VN	6
Zaranj	30.96	61.86	AF	6
Östersund	63.18	14.64	SE	6
Chachoengsao	13.69	101.07	TH	6
Huancavelica	-12.79	-74.97	PE	6
Vratsa	43.21	23.56	BG	6
Hrazdan	40.52	44.76	AM	6
Lusambo	-4.98	23.44	CD	6
Gabú	12.28	-14.22	GW	6
Campobasso	41.56	14.67	IT	6
Salekhard	66.53	66.61	RU	6
Alytus	54.40	24.04	LT	6
Port of Spain	10.67	-61.52	TT	6
Pejë	42.66	20.29	XK	6
Viedma	-40.82	-63.00	AR	6
Impfondo	1.62	18.06	CG	6
Cojutepeque	13.72	-88.93	SV	6
Asadābād	34.87	71.15	AF	6
Kokkola	63.84	23.13	FI	6
Mao	19.55	-71.08	DO	6
Shtip	41.75	22.20	MK	6
Saipan	15.21	145.75	MP	6
Leticia	-4.21	-69.94	CO	6
Puerto Francisco de Orellana	-0.45	-77.00	EC	6
Gabrovo	42.87	25.32	BG	6
Concepción	-23.40	-57.43	PY	6
Tevragh Zeina	18.10	-15.99	MR	6
Bayburt	40.26	40.22	TR	6
Kanye	-24.97	25.33	BW	6
Kibuye	-2.06	29.35	RW	6
Ratnapura	6.69	80.40	LK	6
Aībak	36.26	68.02	AF	6
Ol Kalou	-0.27	36.38	KE	6
Narathiwat	6.43	101.82	TH	6
Paoua	7.24	16.44	CF	6
Sidi Bouzid	35.04	9.48	TN	6
Badulla	6.98	81.06	LK	6
Alajuela	10.02	-84.21	CR	6
Montana	43.41	23.22	BG	6
Lokossa	6.64	1.72	BJ	6
Bria	6.54	21.99	CF	6
Rwamagana	-1.95	30.43	RW	6
Mandeville	18.04	-77.51	JM	6
Tsiroanomandidy	-18.77	46.05	MG	6
Jawhar	2.78	45.50	SO	6
San Marcos	14.96	-91.79	GT	6
Kyustendil	42.28	22.69	BG	6
Manakara	-22.15	48.01	MG	6
Surin	14.88	103.49	TH	6
Lambaréné	-0.70	10.24	GA	6
Phetchaburi	13.11	99.94	TH	6
Mohale's Hoek	-30.15	27.48	LS	6
Dori	14.03	-0.03	BF	6
Middelburg	51.50	3.61	NL	6
Antigua Guatemala	14.56	-90.73	GT	6
Damaturu	11.75	11.96	NG	6
Coyhaique	-45.58	-72.07	CL	6
Komotiní	41.12	25.41	GR	6
Tindouf	27.67	-8.15	DZ	6
Karlovy Vary	50.23	12.87	CZ	6
Centar Župa	41.48	20.56	MK	6
Liberia	10.64	-85.44	CR	6
Sololá	14.77	-91.18	GT	6
Santiago de Veraguas	8.10	-80.98	PA	6
Salcedo	19.38	-70.42	DO	6
Mafeteng	-29.82	27.24	LS	6
Slavonski Brod	45.16	18.02	HR	6
Homa Bay	-0.53	34.46	KE	6
Dededo Village	13.52	144.84	GU	6
Port Loko	8.77	-12.79	SL	6
Choibalsan	48.07	114.53	MN	6
May Pen	17.96	-77.25	JM	6
Si Sa Ket	15.11	104.33	TH	6
Linden	6.01	-58.31	GY	6
Fayzabad	37.12	70.58	AF	6
Bluefields	12.01	-83.76	NI	6
Daman	20.41	72.83	IN	6
Fenoarivo Atsinanana	-17.38	49.41	MG	6
Kardzhali	41.65	25.37	BG	6
Faya-Largeau	17.93	19.10	TD	6
Hlotse	-28.87	28.05	LS	6
Lashkar Gāh	31.59	64.37	AF	6
Artigas	-30.40	-56.47	UY	6
Pattani	6.87	101.25	TH	6
Farah	32.37	62.12	AF	6
Ḩajjah	15.69	43.61	YE	6
Mercedes	-33.25	-58.03	UY	6
Phatthalung	7.62	100.08	TH	6
Ambositra	-20.53	47.24	MG	6
Mouila	-1.87	11.06	GA	6
Murang’a	-0.72	37.15	KE	6
Oshakati	-17.79	15.70	NA	6
Bellinzona	46.19	9.02	CH	6
Lamphun	18.58	99.01	TH	6
Byumba	-1.58	30.07	RW	6
Lai Châu	22.40	103.46	VN	6
Jefferson City	38.58	-92.17	US	6
Famagusta	35.12	33.94	CY	6
Göyçay	40.65	47.74	AZ	6
Tikrīt	34.62	43.68	IQ	6
Santa Elena	-2.23	-80.86	EC	6
Konayev	43.87	77.06	KZ	6
Ohrid	41.12	20.80	MK	6
Iten	0.67	35.51	KE	6
Kapsabet	0.20	35.10	KE	6
Gori	41.99	44.11	GE	6
Tromsø	69.65	18.96	NO	6
Ihosy	-22.40	46.13	MG	6
Karlovac	45.49	15.55	HR	6
Cotuí	19.05	-70.15	DO	6
Barda	40.38	47.13	AZ	6
Slobozia	44.56	27.36	RO	6
San Vicente	13.64	-88.78	SV	6
Cuilapa	14.28	-90.30	GT	6
Shamkhir	40.83	46.02	AZ	6
Viborg	56.45	9.40	DK	6
Aghjabadi	40.05	47.46	AZ	6
Naryn	41.43	76.00	KG	6
Villarrica	-25.75	-56.44	PY	6
Annapolis	38.98	-76.49	US	6
Swords	53.46	-6.22	IE	6
Ouesso	1.61	16.05	CG	6
Butha-Buthe	-28.77	28.25	LS	6
Antsohihy	-14.88	47.99	MG	6
Mukdahan	16.55	104.72	TH	6
Apia	-13.83	-171.77	WS	6
Alexandria	43.98	25.33	RO	6
Yambio	4.57	28.39	SS	6
Tarawa	1.33	172.98	KI	6
Talas	42.52	72.24	KG	6
Shamakhi	40.63	48.64	AZ	6
Durazno	-33.38	-56.52	UY	6
Pärnu	58.39	24.50	EE	6
Guarda	40.54	-7.27	PT	6
Zugdidi	42.51	41.87	GE	6
Corfu	39.62	19.92	GR	6
Kidal	18.44	1.41	ML	6
Massakory	13.00	15.73	TD	6
Zacatecoluca	13.51	-88.87	SV	6
Mörön	49.63	100.16	MN	6
Dover	39.16	-75.52	US	6
Fatick	14.33	-16.41	SN	6
Roi Et	16.06	103.65	TH	6
Gümüşhane	40.46	39.47	TR	6
El Meghaïer	33.95	5.92	DZ	6
Brčko	44.87	18.82	BA	6
Charlottetown	46.23	-63.13	CA	6
Chinsali	-10.54	32.08	ZM	6
Kavadarci	41.43	22.01	MK	6
Nyköping	58.75	17.01	SE	6
Aweil	8.76	27.39	SS	6
Minas	-34.38	-55.24	UY	6
Phrae	18.15	100.14	TH	6
Kalmar	56.66	16.36	SE	6
Fribourg	46.80	7.15	CH	6
El-Tor	28.24	33.62	EG	6
Zwedru	6.07	-8.14	LR	6
Gisborne	-38.65	178.00	NZ	6
Celje	46.23	15.26	SI	6
Kranj	46.24	14.36	SI	6
Al Bayda	13.99	45.57	YE	6
Aghdam	39.99	46.93	AZ	6
Muang Phônsavan	19.45	103.19	LA	6
Jincheng	24.43	118.32	TW	6
Struga	41.18	20.68	MK	6
Tozeur	33.92	8.13	TN	6
Ataq	14.54	46.83	YE	6
Falun	60.60	15.63	SE	6
Banjul	13.45	-16.58	GM	6
Sukhothai	17.01	99.82	TH	6
Cibitoke	-2.89	29.12	BI	6
Ninh Bình	20.26	105.98	VN	6
Farafangana	-22.82	47.83	MG	6
Schaffhausen	47.70	8.63	CH	6
Salyan	39.60	48.98	AZ	6
Kozáni	40.30	21.79	GR	6
Florida	-34.10	-56.21	UY	6
Kajaani	64.23	27.73	FI	6
Marsabit	2.33	37.99	KE	6
Jalilabad	39.21	48.49	AZ	6
Varaždin	46.30	16.34	HR	6
Viana do Castelo	41.69	-8.83	PT	6
Al Qunayţirah	33.13	35.82	SY	6
Kukës	42.08	20.42	AL	6
Gharyan	32.17	13.02	LY	6
Tchibanga	-2.93	10.98	GA	6
Hato Mayor del Rey	18.77	-69.26	DO	6
Kep	10.48	104.32	KH	6
Paphos	34.78	32.42	CY	6
Wete	-5.06	39.73	TZ	6
Port-Vila	-17.74	168.31	VU	6
San José de Mayo	-34.34	-56.71	UY	6
Sai Kung	22.38	114.27	HK	6
Phichit	16.44	100.35	TH	6
Owando	-0.48	15.90	CG	6
Puntarenas	9.98	-84.84	CR	6
Rio Claro	10.31	-61.18	TT	6
Harper	4.38	-7.71	LR	6
Chur	46.85	9.53	CH	6
Hillerød	55.93	12.30	DK	6
Bragança	41.81	-6.76	PT	6
Loei	17.49	101.73	TH	6
Aosta	45.74	7.32	IT	6
Tunceli	39.10	39.54	TR	6
Moussoro	13.64	16.49	TD	6
La Asunción	11.03	-63.86	VE	6
Samut Songkhram	13.41	100.00	TH	6
Zalinjay	12.91	23.47	SD	6
New Amsterdam	6.25	-57.52	GY	6
Arima	10.64	-61.28	TT	6
Marijampolė	54.56	23.35	LT	6
Garoua	9.30	13.40	CM	6
Azogues	-2.74	-78.85	EC	6
Sinop	42.03	35.16	TR	6
Vidin	43.99	22.88	BG	6
Targovishte	43.25	26.57	BG	6
Amnat Charoen	15.86	104.63	TH	6
Beja	38.01	-7.86	PT	6
Sitten	46.23	7.36	CH	6
Salgótarján	48.10	19.80	HU	6
Nakhon Phanom	17.41	104.78	TH	6
Satun	6.62	100.07	TH	6
Cahul	45.90	28.20	MD	6
Miercurea-Ciuc	46.35	25.80	RO	6
Ungheni	47.21	27.80	MD	6
Nong Bua Lamphu	17.20	102.44	TH	6
Kochani	41.92	22.41	MK	6
Imishli	39.87	48.06	AZ	6
Szekszárd	46.35	18.71	HU	6
Ahuachapán	13.92	-89.84	SV	6
Bodø	67.28	14.38	NO	6
Dipayal	29.26	80.94	NP	6
Ocotal	13.63	-86.47	NI	6
Quthing	-30.40	27.70	LS	6
Zuwarah	32.93	12.08	LY	6
Nagua	19.38	-69.85	DO	6
Ceerigaabo	10.62	47.37	SO	6
Strumica	41.44	22.64	MK	6
L'Aquila	42.35	13.40	IT	6
Juticalpa	14.66	-86.22	HN	6
Kayanza	-2.92	29.63	BI	6
Puerto Cabezas	14.04	-83.39	NI	6
Mount Hagen	-5.86	144.23	PG	6
Katima Mulilo	-17.50	24.28	NA	6
Ubari	26.59	12.78	LY	6
Biltine	14.53	20.93	TD	6
Prachuap Khiri Khan	11.82	99.78	TH	6
Bafatá	12.17	-14.66	GW	6
Otjiwarongo	-20.46	16.65	NA	6
Castelo Branco	39.82	-7.49	PT	6
Neuchâtel	46.99	6.93	CH	6
Ziniaré	12.58	-1.30	BF	6
Ramotswa	-24.87	25.87	BW	6
Kampong Speu	11.45	104.52	KH	6
Siaya	0.06	34.29	KE	6
Koh Kong	11.62	102.98	KH	6
Sibiti	-3.68	13.35	CG	6
Prey Veng	11.49	105.33	KH	6
Monaco	43.74	7.42	MC	6
Kapan	39.21	46.41	AM	6
Pilar	-26.86	-58.31	PY	6
Dikhil	11.10	42.37	DJ	6
Ventspils	57.39	21.56	LV	6
Sélibaby	15.16	-12.18	MR	6
Prachin Buri	14.05	101.37	TH	6
Zaqatala	41.63	46.64	AZ	6
Colonia del Sacramento	-34.46	-57.84	UY	6
Fajardo	18.33	-65.65	PR	6
Helena	46.59	-112.04	US	6
Rumbek	6.81	29.68	SS	6
San Pawl il-Baħar	35.95	14.42	MT	6
Chachapoyas	-6.23	-77.87	PE	6
Nyanza	-2.35	29.75	RW	6
Manouba	36.81	10.10	TN	6
Sibut	5.72	19.07	CF	6
Nola	3.52	16.05	CF	6
Juneau	58.30	-134.42	US	6
Sédhiou	12.71	-15.56	SN	6
Maralal	1.10	36.70	KE	6
Siliana	36.08	9.37	TN	6
Krabi	8.07	98.91	TH	6
Kuala Belait	4.58	114.23	BN	6
Atar	20.52	-13.05	MR	6
Kičevo	41.51	20.96	MK	6
Šibenik	43.73	15.89	HR	6
Bubanza	-3.08	29.39	BI	6
Bayanhongor	46.19	100.72	MN	6
Baalbek	34.01	36.22	LB	6
Arendal	58.46	8.77	NO	6
Koulamoutou	-1.14	12.46	GA	6
Tillabéri	14.21	1.45	NE	6
Smolyan	41.57	24.71	BG	6
Sabirabad	40.01	48.48	AZ	6
Zug	47.17	8.52	CH	6
Khorugh	37.49	71.55	TJ	6
Murzuk	25.92	13.92	LY	6
Ulaangom	49.98	92.07	MN	6
Nīlī	33.72	66.13	AF	6
Kédougou	12.56	-12.18	SN	6
Kerugoya	-0.50	37.28	KE	6
Suong	11.91	105.66	KH	6
Rivas	11.44	-85.83	NI	6
Oranjestad	12.52	-70.03	AW	6
Ati	13.21	18.34	TD	6
Mitú	1.26	-70.24	CO	6
Bregenz	47.50	9.75	AT	6
Khovd	48.01	91.64	MN	6
Blenheim	-41.52	173.95	NZ	6
Amdjarass	16.07	22.84	TD	6
Armavir	40.16	44.04	AM	6
Jinotepe	11.85	-86.20	NI	6
Silistra	44.12	27.26	BG	6
Hamar	60.79	11.07	NO	6
Dassa-Zoumè	7.75	2.18	BJ	6
Arvayheer	46.26	102.78	MN	6
Santarém	39.23	-8.69	PT	6
George Town	19.29	-81.37	KY	6
Vega Baja	18.44	-66.39	PR	6
Kitui	-1.37	38.01	KE	6
Boaco	12.47	-85.66	NI	6
Lillehammer	61.12	10.47	NO	6
Boumerdas	36.77	3.48	DZ	6
Razgrad	43.53	26.52	BG	6
Änew	37.89	58.52	TM	6
Manga	11.66	-1.07	BF	6
Kurunegala	7.48	80.37	LK	6
Sa Kaeo	13.81	102.07	TH	6
Nālūt	31.87	10.98	LY	6
Ölgii	48.97	89.96	MN	6
Frankfort	38.20	-84.87	US	6
Mytilene	39.11	26.56	GR	6
Buri Ram	14.99	103.10	TH	6
Whitehorse	60.72	-135.05	CA	6
Popondetta	-8.77	148.23	PG	6
Ayoun El Atrous	16.66	-9.61	MR	6
Lipkovo	42.16	21.59	MK	6
Cataño	18.44	-66.12	PR	6
Saint Helier	49.19	-2.10	JE	6
Labasa	-16.43	179.36	FJ	6
Lovech	43.13	24.72	BG	6
Sisak	45.47	16.38	HR	6
Santa Rosa de Copán	14.77	-88.78	HN	6
Batken	40.06	70.82	KG	6
Matam	15.66	-13.26	SN	6
Sofifi	0.74	127.56	ID	6
Ismayilli	40.78	48.15	AZ	6
Maevatanana	-16.95	46.83	MG	6
Soroca	48.16	28.28	MD	6
Madang	-5.22	145.79	PG	6
Teyateyaneng	-29.15	27.75	LS	6
Ndélé	8.41	20.65	CF	6
Laï	9.40	16.30	TD	6
Jarash	32.28	35.90	JO	6
Dubrovnik	42.64	18.11	HR	6
Freeport	26.53	-78.70	BS	6
La Unión	13.34	-87.84	SV	6
Rocha	-34.48	-54.33	UY	6
Bor	6.21	31.56	SS	6
Kyrenia	35.34	33.32	CY	6
Gwanda	-20.94	29.01	ZW	6
Cartago	9.86	-83.92	CR	6
Cobija	-11.03	-68.77	BO	6
Trípoli	37.51	22.38	GR	6
Gibraltar	36.14	-5.35	GI	6
Al Wakrah	25.17	51.60	QA	6
Rēzekne	56.51	27.34	LV	6
Papeete	-17.53	-149.57	PF	6
Aplahoué	6.93	1.68	BJ	6
Moutsamoudou	-12.17	44.40	KM	6
Kebili	33.70	8.97	TN	6
Fray Bentos	-33.12	-58.31	UY	6
Kokopo	-4.34	152.27	PG	6
Mendi	-6.15	143.66	PG	6
Douglas	54.15	-4.48	IM	6
Siyazan	41.08	49.12	AZ	6
Treinta y Tres	-33.23	-54.39	UY	6
Artvin	41.18	41.82	TR	6
Koper	45.55	13.73	SI	6
Frauenfeld	47.56	8.90	CH	6
Zhongxing New Village	23.96	120.69	TW	6
Aţ Ţafīlah	30.84	35.60	JO	6
Zelino	41.98	21.06	MK	6
Majuro	7.09	171.38	MH	6
Utena	55.50	25.60	LT	6
Lamu	-2.27	40.90	KE	6
Diego Martin	10.72	-61.57	TT	6
Ibrā’	22.69	58.53	OM	6
La Guaira	10.60	-66.93	VE	6
Gros Islet	14.07	-60.95	LC	6
Fuzuli	39.60	47.15	AZ	6
Härnösand	62.63	17.94	SE	6
Stung Treng	13.53	105.97	KH	6
Muang Xay	20.69	101.98	LA	6
Radovis	41.64	22.46	MK	6
Hakha	22.64	93.61	MM	6
Orhei	47.39	28.83	MD	6
Puyo	-1.49	-78.00	EC	6
Dalandzadgad	43.57	104.42	MN	6
Ebebiyin	2.15	11.33	GQ	6
Guastatoya	14.85	-90.07	GT	6
Makokou	0.57	12.86	GA	6
Kajiado	-1.85	36.78	KE	6
Nan	18.78	100.78	TH	6
Kabarnet	0.49	35.74	KE	6
Ranong	9.97	98.63	TH	6
Pathum Thani	14.01	100.53	TH	6
Kingstown	13.16	-61.23	VC	6
Espargos	16.76	-22.94	CV	6
Nyamira	-0.56	34.94	KE	6
Vị Thanh	9.78	105.47	VN	6
Novo Mesto	45.80	15.17	SI	6
Hūn	29.13	15.95	LY	6
Bjelovar	45.90	16.85	HR	6
Tbeng Meanchey	13.81	104.98	KH	6
Birkirkara	35.90	14.46	MT	6
Velenje	46.36	15.11	SI	6
Al Jahrā’	29.34	47.66	KW	6
Nueva Loja	0.09	-76.90	EC	6
Canelones	-34.52	-56.28	UY	6
Tak	16.87	99.13	TH	6
Batangafo	7.30	18.28	CF	6
Caazapá	-26.20	-56.37	PY	6
Svay Rieng	11.09	105.80	KH	6
Macas	-2.31	-78.12	EC	6
Maintirano	-18.06	44.03	MG	6
Santa Cruz de El Seibo	18.76	-69.04	DO	6
Damongo	9.08	-1.82	GH	6
Ağdaş	40.65	47.47	AZ	6
Mosta	35.91	14.43	MT	6
Gjirokastër	40.08	20.14	AL	6
Visby	57.64	18.30	SE	6
Laḩij	13.06	44.88	YE	6
Allada	6.67	2.15	BJ	6
Divichibazar	41.20	48.99	AZ	6
Sisophon	13.59	102.97	KH	6
Hacıqabul	40.04	48.94	AZ	6
Massawa	15.61	39.47	ER	6
Tearce	42.08	21.05	MK	6
Voinjama	8.42	-9.75	LR	6
Keetmanshoop	-26.58	18.13	NA	6
Ardahan	41.11	42.70	TR	6
Comrat	46.29	28.66	MD	6
Trinidad	-33.52	-56.90	UY	6
Victoria	-4.62	55.46	SC	6
Edineţ	48.17	27.30	MD	6
Valmiera	57.54	25.43	LV	6
Artashat	39.95	44.55	AM	6
Ogre	56.82	24.61	LV	6
Sühbaatar	50.23	106.21	MN	6
Undurkhaan	47.32	110.66	MN	6
Kampot	10.61	104.18	KH	6
Gobabis	-22.45	18.97	NA	6
Sliema	35.91	14.50	MT	6
Dambai	8.07	0.18	GH	6
Molde	62.74	7.16	NO	6
Quba	41.36	48.51	AZ	6
Nuku‘alofa	-21.14	-175.20	TO	6
Tsirang	27.02	90.12	BT	6
Portalegre	39.29	-7.43	PT	6
Barceloneta	18.45	-66.54	PR	6
Aghsu	40.57	48.40	AZ	6
Koprivnica	46.16	16.83	HR	6
Vukovar	45.35	19.00	HR	6
Uthai Thani	15.38	100.02	TH	6
Guaranda	-1.59	-79.00	EC	6
Timimoun	29.26	0.24	DZ	6
Dhankutā	26.98	87.33	NP	6
Tubmanburg	6.87	-10.82	LR	6
Maliana	-8.99	125.22	TL	6
Pakxan	18.39	103.66	LA	6
Heredia	10.00	-84.12	CR	6
Sankt Pölten	48.21	15.64	AT	6
Mbaïki	3.87	17.99	CF	6
Goaso	6.80	-2.52	GH	6
Căuşeni	46.64	29.41	MD	6
Karak City	31.16	35.76	JO	6
Yasothon	15.79	104.15	TH	6
Tsetserleg	47.48	101.45	MN	6
Trat	12.24	102.52	TH	6
Guayama	17.98	-66.11	PR	6
Suai	-9.31	125.26	TL	6
Aarau	47.39	8.04	CH	6
Punākha	27.59	89.88	BT	6
Nakhon Nayok	14.20	101.21	TH	6
Assab	13.01	42.74	ER	6
Assomada	15.10	-23.68	CV	6
Telsiai	55.98	22.25	LT	6
Taurage	55.25	22.29	LT	6
San José de Ocoa	18.55	-70.51	DO	6
Phayao	19.19	99.88	TH	6
Jēkabpils	56.50	25.86	LV	6
Laventille	10.65	-61.50	TT	6
Puerto Carreño	6.19	-67.48	CO	6
Hola	-1.48	40.03	KE	6
Kriva Palanka	42.20	22.33	MK	6
Gazakh	41.09	45.37	AZ	6
Zaghouan	36.40	10.14	TN	6
Bozoum	6.32	16.38	CF	6
Gevgelija	41.14	22.50	MK	6
Ariel	32.11	35.18	IL	6
Yigo Village	13.54	144.89	GU	6
Flores	16.92	-89.90	GT	6
Andorra la Vella	42.51	1.52	AD	6
Tartar	40.34	46.93	AZ	6
Humacao	18.15	-65.83	PR	6
Sensuntepeque	13.88	-88.63	SV	6
Yellowknife	62.45	-114.37	CA	6
Somoto	13.48	-86.58	NI	6
Saatlı	39.93	48.37	AZ	6
Yauco	18.03	-66.85	PR	6
Nueva Gerona	21.89	-82.81	CU	6
Greenville	5.01	-9.04	LR	6
Sekong	15.35	106.72	LA	6
Ponta Delgada	37.74	-25.67	PT	6
Torit	4.41	32.57	SS	6
Sing Buri	14.89	100.40	TH	6
Castries	14.00	-61.01	LC	6
Charlotte Amalie	18.34	-64.93	VI	6
Kratié	12.49	106.02	KH	6
Kampong Thom	12.71	104.89	KH	6
Richmond	-41.33	173.18	NZ	6
Filadelfia	-22.34	-60.03	PY	6
Saynshand	44.88	110.12	MN	6
Zinjibār	13.13	45.38	YE	6
Telavi	41.92	45.47	GE	6
Goygol	40.59	46.32	AZ	6
Jericho	31.87	35.45	PS	6
Wote	-1.78	37.63	KE	6
Tamuning-Tumon-Harmon Village	13.49	144.78	GU	6
Herceg Novi	42.45	18.54	ME	6
Tadjoura	11.79	42.88	DJ	6
Negotino	41.48	22.09	MK	6
Ijevan	40.88	45.15	AM	6
Pljevlja	43.36	19.36	ME	6
Shusha	39.76	46.75	AZ	6
Chalatenango	14.04	-88.94	SV	6
Strășeni	47.14	28.61	MD	6
Akureyri	65.68	-18.09	IS	6
Aleg	17.05	-13.91	MR	6
Tutong	4.80	114.65	BN	6
Mārupe	56.91	24.05	LV	6
Kyurdarmir	40.34	48.16	AZ	6
Point Fortin	10.17	-61.68	TT	6
Ghanzi	-21.70	21.65	BW	6
Likisá	-8.59	125.34	TL	6
Al Khawr	25.68	51.51	QA	6
Gavar	40.35	45.12	AM	6
Augusta	44.31	-69.78	US	6
Kimbe	-5.55	150.14	PG	6
Jwaneng	-24.60	24.73	BW	6
Lezhë	41.78	19.64	AL	6
Samraong	14.18	103.52	KH	6
Neiba	18.49	-71.42	DO	6
Neftçala	39.38	49.25	AZ	6
Whakatane	-37.96	176.99	NZ	6
Hinche	19.14	-72.01	HT	6
Half Way Tree	18.01	-76.80	JM	6
Goroka	-6.08	145.39	PG	6
Cayey	18.11	-66.17	PR	6
Al Ḩazm	16.16	44.78	YE	6
Wewak	-3.55	143.63	PG	6
Lelydorp	5.70	-55.23	SR	6
Studeničani	41.92	21.53	MK	6
Vinica	41.88	22.51	MK	6
Baruun-Urt	46.68	113.28	MN	6
Pushkino	39.46	48.55	AZ	6
Koungou	-12.73	45.20	YT	6
Debar	41.52	20.52	MK	6
Nar'yan-Mar	67.64	53.00	RU	6
Budva	42.29	18.84	ME	6
Ptuj	46.42	15.87	SI	6
Khasab	26.18	56.25	OM	6
Sanniquellie	7.36	-8.71	LR	6
Pailin	12.85	102.61	KH	6
Salaspils	56.86	24.37	LV	6
Mendefera	14.89	38.82	ER	6
Tunapuna	10.65	-61.39	TT	6
Bar	42.09	19.10	ME	6
Centre de Flacq	-20.19	57.71	MU	6
Altai	46.37	96.26	MN	6
Ashtarak	40.30	44.36	AM	6
La Paz	14.32	-87.68	HN	6
Arta	11.53	42.85	DJ	6
Bu’aale	1.08	42.58	SO	6
Akhaltsikhe	41.64	42.99	GE	6
Nalerigu	10.53	-0.37	GH	6
Delcevo	41.97	22.77	MK	6
Viljandi	58.36	25.59	EE	6
Aileu	-8.73	125.57	TL	6
Bulgan	48.81	103.53	MN	6
Mehtar Lām	34.67	70.21	AF	6
Loikaw	19.68	97.21	MM	6
Fomboni	-12.29	43.74	KM	6
Fada	17.19	21.58	TD	6
Lospalos	-8.52	127.00	TL	6
Tena	-1.00	-77.81	EC	6
Dutse	11.76	9.34	NG	6
San Fernando de Monte Cristi	19.85	-71.65	DO	6
Vila Real	41.30	-7.74	PT	6
Banlung	13.74	106.99	KH	6
Scarborough	11.18	-60.74	TT	6
Dzuunmod	47.71	106.95	MN	6
Hînceşti	46.83	28.59	MD	6
Požega	45.34	17.69	HR	6
Qormi	35.88	14.47	MT	6
Ma'rib	15.46	45.33	YE	6
Solothurn	47.21	7.54	CH	6
Kwun Tong	22.31	114.22	HK	6
Thaba-Tseka	-29.52	28.61	LS	6
Floreşti	47.89	28.29	MD	6
San Juan Bautista	-26.67	-57.14	PY	6
Roseau	15.30	-61.39	DM	6
Savanna-la-Mar	18.22	-78.13	JM	6
Resen	41.09	21.01	MK	6
Saint Peter Port	49.46	-2.54	GG	6
Ilinden	41.99	21.58	MK	6
Dajabón	19.55	-71.71	DO	6
San Ignacio de Sabaneta	19.48	-71.34	DO	6
Kargil	34.56	76.13	IN	6
Brvenica	41.97	20.98	MK	6
Uliastay	47.74	96.84	MN	6
Penonomé	8.52	-80.36	PA	6
Tukums	56.97	23.16	LV	6
San Francisco	13.69	-88.10	SV	6
Manatí	18.43	-66.49	PR	6
Drochia	48.04	27.81	MD	6
Aguadilla	18.43	-67.15	PR	6
Qusar	41.43	48.43	AZ	6
Baukau	-8.48	126.46	TL	6
Sangre Grande	10.59	-61.13	TT	6
Keflavík	64.00	-22.56	IS	6
Barentu	15.11	37.59	ER	6
Rosso	16.51	-15.81	MR	6
les Escaldes	42.51	1.53	AD	6
Akjoujt	19.74	-14.39	MR	6
Yoro	15.14	-87.13	HN	6
Herisau	47.39	9.28	CH	6
Ujar	40.52	47.65	AZ	6
Żabbar	35.88	14.54	MT	6
Anadyr	64.73	177.51	RU	6
Beylagan	39.78	47.62	AZ	6
Monte Plata	18.81	-69.78	DO	6
Kirundo	-2.58	30.10	BI	6
Chai Nat	15.19	100.12	TH	6
Obock	11.97	43.29	DJ	6
Bijelo Polje	43.04	19.75	ME	6
Djambala	-2.54	14.75	CG	6
Dzaoudzi	-12.78	45.26	YT	6
West Bay	19.38	-81.39	KY	6
Orange Walk	18.08	-88.56	BZ	6
Zamora	-4.06	-78.95	EC	6
Daru	-9.08	143.21	PG	6
Mangilao Village	13.45	144.80	GU	6
Astara	38.46	48.87	AZ	6
Schwyz	47.02	8.65	CH	6
Tipasa	36.59	2.45	DZ	6
Bogovinje	41.92	20.92	MK	6
Trbovlje	46.15	15.05	SI	6
Cetinje	42.39	18.91	ME	6
Santa Bárbara	14.92	-88.24	HN	6
Čakovec	46.38	16.43	HR	6
Cēsis	57.31	25.27	LV	6
Nuuk	64.18	-51.72	GL	6
Belmopan	17.25	-88.76	BZ	6
Avarua	-21.21	-159.78	CK	6
Tórshavn	62.01	-6.77	FO	6
Basseterre	17.30	-62.72	KN	6
Pago Pago	-14.28	-170.70	AS	6
Basse-Terre	16.00	-61.73	GP	6
Mariehamn	60.10	19.93	AX	6
Kralendijk	12.15	-68.27	BQ	6
Road Town	18.43	-64.62	VG	6
Saint George's	12.05	-61.75	GD	6
Palikir	6.92	158.16	FM	6
Valletta	35.90	14.51	MT	6
Funafuti	-8.52	179.19	TV	6
Saint-Pierre	46.78	-56.18	PM	6
Gustavia	17.90	-62.85	BL	6
Marigot	18.07	-63.08	MF	6
Vaduz	47.14	9.52	LI	6
San Marino	43.94	12.45	SM	6
Cockburn Town	21.46	-71.14	TC	6
Longyearbyen	78.22	15.65	SJ	6
Stanley	-51.69	-57.86	FK	6
The Valley	18.22	-63.06	AI	6
Ciudad de la Paz	1.59	10.82	GQ	6
Philipsburg	18.03	-63.05	SX	6
Mata-Utu	-13.28	-176.17	WF	6
Yaren	-0.55	166.93	NR	6
Hagåtña	13.48	144.75	GU	6
Hamilton	32.29	-64.78	BM	6
Kingston	-29.05	167.97	NF	6
Vatican City	41.90	12.45	VA	6
Jamestown	-15.92	-5.72	SH	6
Alofi	-19.05	-169.92	NU	6
Flying Fish Cove	-10.42	105.68	CX	6
West Island	-12.16	96.82	CC	6
Adamstown	-25.07	-130.10	PN	6
Port-aux-Français	-49.35	70.22	TF	6
Grytviken	-54.28	-36.51	GS	6
Plymouth	16.71	-62.21	MS	6
Ngerulmud	7.50	134.62	PW	6`;
