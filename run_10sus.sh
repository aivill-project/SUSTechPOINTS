# port range from 8501 to 8509, run 10 main2.py

for i in {8502..8509}
do 
    python main2.py --port $i &
done