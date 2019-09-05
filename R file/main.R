setwd('C:/Users/kenny/Desktop/GTD Story/data')

library('tidyverse')
library('ggthemes')

fulldf <- read_csv("globalterrorismdb_0718dist.csv")


df <- fulldf %>%
  select(iyear, imonth, iday, country_txt, region_txt, provstate, city, latitude, longitude, summary, multiple, attacktype1_txt, targtype1_txt, targsubtype1_txt, gname, weaptype1_txt, nkill, nwound, nkillter) 

df <- df %>%
  rename(year = iyear, month = imonth, day = iday, country = country_txt, region = region_txt, provstate = provstate, multiple_attack = multiple, attacktype = attacktype1_txt, target_type = targtype1_txt, target_sub_type = targsubtype1_txt, group_name = gname, weapon_type = weaptype1_txt)

df <- df %>%
  mutate(decade = 
           ifelse(year<1980, '70s', 
                  ifelse(year < 1990, '80s', 
                         ifelse(year < 2000, '90s', 
                                ifelse( year < 2010, '2000s', '2010s')))))

df$decade <- factor(df$decade, levels=c("70s", "80s", "90s", "2000s", "2010s"))


# Timeseries plot
ggplot(data=df, aes(x=year)) +
  geom_histogram(stat='count') +
  theme_tufte() +
  labs(title='All global terrorist attacks over time')
